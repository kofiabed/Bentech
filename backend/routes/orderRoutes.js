// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id/status')
  .put(protect, authorizeRoles('staff', 'admin'), updateOrderStatus);

module.exports = router;