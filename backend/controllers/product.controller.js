const mongoose = require('mongoose');
const Product = require('../models/product.model');

// Task 2: Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !category || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (price === undefined || price === null || Number(price) <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    if (stock === undefined || stock === null || Number(stock) < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 3 + Task 5 + Bonus: Get All Products (search, category filter, sort)
exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    let query = Product.find(filter);

    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 4: Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
