const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require('../controllers/cart.controller');

// Every cart route is protected: the user is identified from the JWT cookie.
router.post('/:productId', protect, addToCart);
router.get('/', protect, getCart);
router.patch('/:productId', protect, updateCartQuantity);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;
