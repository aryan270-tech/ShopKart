const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const PRODUCT_FIELDS = 'name description price category image stock';

// Loads the customer's cart with Product data populated, dropping any
// entries whose Product has since been deleted.
const loadPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: 'cart.product',
    select: PRODUCT_FIELDS,
  });
  return customer.cart.filter((item) => item.product);
};

const findCartItem = (customer, productId) =>
  customer.cart.find((item) => item.product.toString() === productId);

// Task 2: Add Product to Cart
// Not in cart -> add with quantity 1. Already in cart -> quantity + 1.
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);
    const existing = findCartItem(customer, productId);
    const newQuantity = existing ? existing.quantity + 1 : 1;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message:
          product.stock <= 0
            ? 'Product is out of stock'
            : `Only ${product.stock} unit(s) available`,
      });
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: await loadPopulatedCart(req.user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 3: Get Current User's Cart
exports.getCart = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      cart: await loadPopulatedCart(req.user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 4: Update Product Quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
      return res
        .status(400)
        .json({ message: 'Quantity must be a whole number' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);
    const existing = findCartItem(customer, productId);
    if (!existing) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} unit(s) available`,
      });
    }

    existing.quantity = quantity;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: await loadPopulatedCart(req.user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 5: Remove Product from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);
    const existing = findCartItem(customer, productId);
    if (!existing) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: await loadPopulatedCart(req.user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
