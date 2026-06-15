const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true }
  }],
  shippingDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true }
  },
  deliveryType: { type: String, enum: ['standard', 'express'], default: 'standard' },
  paymentMethod: { type: String, enum: ['momo', 'card', 'cod'], required: true },
  financials: {
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    grandTotal: { type: Number, required: true }
  },
  status: { type: String, enum: ['Processing', 'In Transit', 'Approved', 'Delivered', 'Refunded'], default: 'Processing' },
  trackingUpdate: { type: String, default: 'Order registered into fulfillment queue.' },
  reference: { type: String, default: null },
  paymentReference: { type: String, default: null },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);