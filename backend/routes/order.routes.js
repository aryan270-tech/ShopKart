const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');

// Every order route is protected.
router.post('/create-payment-order', protect, createPaymentOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
// Bonus: dev-only status progression
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;
