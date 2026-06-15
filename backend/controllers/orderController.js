const Order = require('../models/orderModel');

exports.getOrders = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    const orders = await Order.find(query)
      .populate('user', 'name email phone role')
      .populate('items.product', 'name img price category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order (Any verified customer)
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingDetails, deliveryType, paymentMethod, financials, reference, paymentReference, paymentStatus } = req.body;
    
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingDetails,
      deliveryType,
      paymentMethod,
      financials,
      reference,
      paymentReference,
      paymentStatus: paymentStatus || (paymentMethod === 'card' ? 'pending' : 'paid')
    });
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status or logistics string (Staff & Admin only)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingUpdate } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Target order record missing.' });
    }
    
    if (status) order.status = status;
    if (trackingUpdate) order.trackingUpdate = trackingUpdate;
    
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};