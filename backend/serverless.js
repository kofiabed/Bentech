const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : true,
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ben_technova_ghana';
const User = require('./models/userModel');
const Product = require('./models/productModel');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Database connected');
    try {
      await Product.deleteMany({});
      await Product.insertMany([
        { name: "HP ProBook 450 G10", price: 9500, oldPrice: 11000, category: "Laptops", tag: "Best Seller", brand: "HP", img: "/hp_probook.png", stock: 15 },
        { name: "Apple MacBook Air M3", price: 14500, oldPrice: 16000, category: "Laptops", tag: "Featured", brand: "Apple", img: "/macbook_air.png", stock: 8 },
        { name: "Samsung Galaxy S24 Ultra", price: 13800, oldPrice: 15000, category: "Smartphones", tag: "Flash Sale", brand: "Samsung", img: "/s24_ultra.png", stock: 12 },
        { name: "iPhone 15 Pro Max", price: 14200, oldPrice: 15500, category: "Smartphones", tag: "Best Seller", brand: "Apple", img: "/iphone_15.png", stock: 10 },
        { name: "Sony WH-1000XM5", price: 4200, oldPrice: 4800, category: "Audio & Sound", tag: "Featured", brand: "Sony", img: "/sony_headphones.png", stock: 20 },
        { name: "Apple AirPods Pro Gen 2", price: 2600, oldPrice: 3000, category: "Audio & Sound", tag: "Flash Sale", brand: "Apple", img: "/airpods_pro.png", stock: 25 },
        { name: "Quantum Smart Watch V2", price: 750, oldPrice: 950, category: "Wearables", tag: "Featured", brand: "Quantum", img: "/quantum_watch.png", stock: 30 },
        { name: "Sony PlayStation 5 Slim", price: 6800, oldPrice: 7500, category: "Gaming", tag: "Best Seller", brand: "Sony", img: "/playstation_5.png", stock: 14 },
        { name: "Logitech MX Master 3S", price: 1200, oldPrice: 1400, category: "Accessories", tag: "Featured", brand: "Logitech", img: "/logitech_mouse.png", stock: 18 },
        { name: "Nintendo Switch OLED Model", price: 3900, oldPrice: 4500, category: "Gaming", tag: "Best Seller", brand: "Nintendo", img: "/nintendo_switch.png", stock: 10 },
        { name: "Apple Watch Ultra 2", price: 9800, oldPrice: 11000, category: "Wearables", tag: "Featured", brand: "Apple", img: "/apple_watch_ultra.png", stock: 6 },
        { name: "Dell XPS 15 9530", price: 18500, oldPrice: 21000, category: "Laptops", tag: "Featured", brand: "Dell", img: "/dell_xps.png", stock: 5 },
        { name: "Bose QuietComfort Ultra", price: 4900, oldPrice: 5500, category: "Audio & Sound", tag: "New Arrival", brand: "Bose", img: "/bose_headphones.png", stock: 12 },
        { name: "Google Pixel 8 Pro", price: 9200, oldPrice: 10500, category: "Smartphones", tag: "New Arrival", brand: "Google", img: "/pixel_8_pro.png", stock: 8 }
      ]);
      console.log('Products seeded');
      const adminExists = await User.findOne({ email: 'ben@technova.gh' }).select('+password');
      if (!adminExists) {
        await User.create({ name: "Bernard Ofori", email: "ben@technova.gh", password: "Bentech@12", role: "admin" });
        console.log('Admin seeded');
      } else if (!adminExists.password || !adminExists.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash('Bentech@12', 12);
        await User.findByIdAndUpdate(adminExists._id, { password: hashedPassword });
        console.log('Admin password rehashed');
      }
    } catch (seedErr) {
      console.error('Seed error:', seedErr.message);
    }
  })
  .catch(err => console.error('DB connection error:', err.message));

mongoose.connection.on('error', err => console.error('DB runtime error:', err));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "Healthy", message: "Ben-TechNova-Ghana API Gateway", timestamp: new Date() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Resource Not Found - [${req.method}] ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
