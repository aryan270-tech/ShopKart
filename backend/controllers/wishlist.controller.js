const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Task 2: Add Product to Wishlist
exports.addToWishlist = async (req, res) => {
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

    const alreadySaved = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadySaved) {
      return res.status(409).json({ message: 'Product already in wishlist' });
    }

    customer.wishlist.push(productId);
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 3: Get Current User's Wishlist
exports.getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock',
    });

    res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 4: Remove Product from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);

    const exists = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (!exists) {
      return res.status(404).json({ message: 'Product not in wishlist' });
    }

    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
