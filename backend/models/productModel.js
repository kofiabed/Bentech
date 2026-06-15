const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  price: { type: Number, required: [true, 'Product price is required'], min: 0 },
  oldPrice: { type: Number, default: null },
  category: { type: String, required: [true, 'Category is required'], trim: true },
  tag: { type: String, enum: ['Flash Sale', 'Best Seller', 'New Arrival', 'Featured', null], default: null },
  brand: { type: String, default: 'TechNova' },
  img: { type: String, required: [true, 'Emoji or structural image asset path is required'] },
  stock: { type: Number, required: [true, 'Stock volume capacity tracking required'], default: 0 },
  description: { type: String, default: '' },
  rating: { type: Number, default: 5 },
  specs: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);