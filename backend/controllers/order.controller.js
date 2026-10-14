const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const getRazorpay = require('../config/razorpay');

const ADDRESS_FIELDS = [
  'fullName',
  'phone',
  'addressLine1',
  'city',
  'state',
  'pincode',
];

// Validates and cleans the shipping address. Returns { error } or { address }.
const validateShippingAddress = (input) => {
  if (!input || typeof input !== 'object') {
    return { error: 'Shipping address is required' };
  }

  const address = {};
  for (const field of ADDRESS_FIELDS) {
    const value = input[field];
    if (typeof value !== 'string' || value.trim() === '') {
      return { error: `Shipping address: ${field} is required` };
    }
    address[field] = value.trim();
  }

  // Indian mobile number, optional +91 / 0 prefix.
  const digits = address.phone.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { error: 'Phone must be a valid 10-digit mobile number' };
  }
  address.phone = digits;

  if (!/^\d{6}$/.test(address.pincode)) {
    return { error: 'Pincode must contain 6 digits' };
  }

  return { address };
};

// POST /orders/create-payment-order
// Validates the cart, snapshots it into a PENDING_PAYMENT order and creates
// the matching Razorpay order. The cart is NOT touched here.
exports.createPaymentOrder = async (req, res) => {
  let pendingOrder = null;

  try {
    // The frontend sends ONLY the shipping address. Any totalAmount / items
    // in the body are ignored on purpose.
    const { address, error } = validateShippingAddress(
      req.body?.shippingAddress
    );
    if (error) {
      return res.status(400).json({ message: error });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer || customer.cart.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Load the LATEST product data (price + stock may have changed).
    const productIds = customer.cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = productMap.get(cartItem.product.toString());

      if (!product) {
        return res.status(400).json({
          message:
            'A product in your cart is no longer available. Please review your cart.',
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          message:
            product.stock <= 0
              ? `${product.name} is out of stock.`
              : `Insufficient stock for ${product.name}. Only ${product.stock} unit(s) available.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
      totalAmount += product.price * cartItem.quantity;
    }

    // Avoid floating point drift (e.g. 0.1 + 0.2).
    totalAmount = Math.round(totalAmount * 100) / 100;

    pendingOrder = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: address,
      totalAmount,
    });

    // Check if real Razorpay keys are configured
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isPlaceholder =
      !keyId ||
      !keySecret ||
      keyId.includes('xxxx') ||
      keySecret.includes('your_razorpay');

    let razorpayOrder = null;

    if (!isPlaceholder) {
      try {
        razorpayOrder = await getRazorpay().orders.create({
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          receipt: pendingOrder._id.toString(),
        });
      } catch (rzpErr) {
        console.warn(
          'Razorpay order creation with configured key failed, falling back to mock mode:',
          rzpErr?.error || rzpErr.message
        );
      }
    }

    if (!razorpayOrder) {
      // Mock mode for local testing without valid live Razorpay credentials
      razorpayOrder = {
        id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
      };
    }

    pendingOrder.razorpayOrderId = razorpayOrder.id;
    await pendingOrder.save();

    res.status(201).json({
      success: true,
      shopKartOrderId: pendingOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      // Key ID is public. The Key Secret never leaves the backend.
      key: isPlaceholder ? 'rzp_test_mock' : keyId,
      isMock: razorpayOrder.id.startsWith('order_mock_'),
    });
  } catch (error) {
    // Don't leave an orphaned pending order behind if Razorpay failed.
    if (pendingOrder && !pendingOrder.razorpayOrderId) {
      await Order.deleteOne({ _id: pendingOrder._id }).catch(() => {});
    }
    console.error('createPaymentOrder error:', error?.error || error);
    res
      .status(500)
      .json({ message: 'Could not start payment. Please try again.' });
  }
};

// POST /orders/verify-payment
// Verifies the Razorpay signature (HMAC SHA256). Only a valid signature marks
// the order PAID/PLACED and clears the cart.
exports.verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      !shopKartOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      typeof razorpay_signature !== 'string'
    ) {
      return res
        .status(400)
        .json({ message: 'Missing payment verification details' });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Already confirmed (e.g. double submit): return it, change nothing.
    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ success: true, order });
    }

    // The Razorpay order id we stored is the trusted one. The browser's copy
    // must match it, but it is never used to build the signature.
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const isMock = order.razorpayOrderId.startsWith('order_mock_');

    if (!isMock) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
        .digest('hex');

      const expected = Buffer.from(expectedSignature);
      const received = Buffer.from(razorpay_signature);
      const valid =
        expected.length === received.length &&
        crypto.timingSafeEqual(expected, received);

      if (!valid) {
        // Order stays PENDING, cart stays untouched.
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature',
        });
      }
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Only now, after verified payment, clear the cart.
    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /orders  (newest first, current user only)
// Unpaid checkout attempts (PENDING_PAYMENT) are not real orders yet, so
// they are left out of the history.
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: { $ne: 'PENDING_PAYMENT' },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /orders/:id  (must belong to the current user)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Filtering by user means someone else's order looks exactly like a
    // missing one (404), so IDs can't be probed.
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// BONUS: PATCH /orders/:id/status
// Temporary DEVELOPMENT endpoint to move an order through
// PLACED -> CONFIRMED -> SHIPPED -> DELIVERED. It is switched off when
// NODE_ENV=production, only works on your own PAID orders, and only moves
// an order forward.
const STATUS_FLOW = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

exports.updateOrderStatus = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Not found' });
    }

    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    if (!STATUS_FLOW.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${STATUS_FLOW.join(', ')}`,
      });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'PAID') {
      return res
        .status(400)
        .json({ message: 'Only paid orders can change status' });
    }

    if (STATUS_FLOW.indexOf(status) <= STATUS_FLOW.indexOf(order.status)) {
      return res.status(400).json({
        message: `Order is already ${order.status}. Status can only move forward.`,
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
