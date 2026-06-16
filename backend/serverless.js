const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fix DNS resolution for MongoDB Atlas SRV records

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach(url => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocal) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ben_technova_ghana';

// Serverless-friendly connection caching (reuses across warm invocations)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGO_URI).then(async (m) => {
      console.log('Database connected (serverless)');
      try {
        await autoSeed();
      } catch (seedErr) {
        console.error('Auto-seed error:', seedErr.message);
      }
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Middleware that ensures DB is connected before handling any API request
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection middleware error:', err.message);
    res.status(503).json({ success: false, message: `Database connection unavailable: ${err.message}` });
  }
});

mongoose.connection.on('error', err => console.error('DB runtime error:', err));

// Auto-seed function (runs on cold start to ensure data exists)
async function autoSeed() {
  try {
    const User = require('./models/userModel');
    const Product = require('./models/productModel');

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding products into database...');
      await Product.insertMany([
        { name: "HP ProBook 450 G10", price: 9500, oldPrice: 11000, category: "Laptops", tag: "Best Seller", brand: "HP", img: "/hp_probook.png", stock: 15, description: "HP ProBook 450 G10 Laptop, 15.6 inch Display, Intel Core i7 13th Gen, 16GB DDR4 RAM, 512GB NVMe SSD, Windows 11 Pro.", rating: 5, specs: { Processor: "Intel Core i7-1355U", RAM: "16GB DDR4", Storage: "512GB SSD PCIe NVMe", OS: "Windows 11 Pro" } },
        { name: "Apple MacBook Air M3", price: 14500, oldPrice: 16000, category: "Laptops", tag: "Featured", brand: "Apple", img: "/macbook_air.png", stock: 8, description: "Apple MacBook Air 13.6-inch with M3 chip, 8GB Unified Memory, 256GB SSD storage.", rating: 5, specs: { Processor: "Apple M3 Chip", RAM: "8GB Unified Memory", Storage: "256GB SSD", ScreenSize: "13.6-inch Liquid Retina" } },
        { name: "Samsung Galaxy S24 Ultra", price: 13800, oldPrice: 15000, category: "Smartphones", tag: "Flash Sale", brand: "Samsung", img: "/s24_ultra.png", stock: 12, description: "Samsung Galaxy S24 Ultra 5G, 256GB ROM, 12GB RAM, Titanium Gray.", rating: 5, specs: { Screen: "6.8-inch Dynamic AMOLED 2X", RAM: "12GB", Storage: "256GB", Camera: "200MP + 50MP + 12MP + 10MP" } },
        { name: "iPhone 15 Pro Max", price: 14200, oldPrice: 15500, category: "Smartphones", tag: "Best Seller", brand: "Apple", img: "/iphone_15.png", stock: 10, description: "Apple iPhone 15 Pro Max, 256GB, Titanium Blue. 48MP main camera.", rating: 5, specs: { Processor: "A17 Pro chip", Screen: "6.7-inch Super Retina XDR", Storage: "256GB", Camera: "48MP Main" } },
        { name: "Sony WH-1000XM5", price: 4200, oldPrice: 4800, category: "Audio & Sound", tag: "Featured", brand: "Sony", img: "/sony_headphones.png", stock: 20, description: "Sony WH-1000XM5 Wireless Noise Canceling Headphones.", rating: 5, specs: { Type: "Over-Ear Wireless", BatteryLife: "Up to 30 hours", NoiseCancelling: "Yes" } },
        { name: "Apple AirPods Pro Gen 2", price: 2600, oldPrice: 3000, category: "Audio & Sound", tag: "Flash Sale", brand: "Apple", img: "/airpods_pro.png", stock: 25, description: "Apple AirPods Pro (2nd Generation) Wireless Earbuds.", rating: 5, specs: { Type: "In-Ear Wireless", Chip: "Apple H2", NoiseCancelling: "Yes" } },
        { name: "Quantum Smart Watch V2", price: 750, oldPrice: 950, category: "Wearables", tag: "Featured", brand: "Quantum", img: "/quantum_watch.png", stock: 30, description: "Quantum Smart Watch V2 with AMOLED Display, Bluetooth Calling.", rating: 4, specs: { Display: "1.43-inch AMOLED", BatteryLife: "Up to 7 days" } },
        { name: "Sony PlayStation 5 Slim", price: 6800, oldPrice: 7500, category: "Gaming", tag: "Best Seller", brand: "Sony", img: "/playstation_5.png", stock: 14, description: "PlayStation 5 Console - Slim Digital Edition.", rating: 5, specs: { Storage: "1TB Custom SSD", Output: "4K 120Hz support" } },
        { name: "Logitech MX Master 3S", price: 1200, oldPrice: 1400, category: "Accessories", tag: "Featured", brand: "Logitech", img: "/logitech_mouse.png", stock: 18, description: "Logitech MX Master 3S Wireless Performance Mouse.", rating: 5, specs: { DPI: "8000 max", Battery: "Rechargeable Li-Po" } },
        { name: "Nintendo Switch OLED Model", price: 3900, oldPrice: 4500, category: "Gaming", tag: "Best Seller", brand: "Nintendo", img: "/nintendo_switch.png", stock: 10, description: "Nintendo Switch OLED Model with White Joy-Con.", rating: 5, specs: { Screen: "7-inch OLED", Storage: "64GB" } },
        { name: "Apple Watch Ultra 2", price: 9800, oldPrice: 11000, category: "Wearables", tag: "Featured", brand: "Apple", img: "/apple_watch_ultra.png", stock: 6, description: "Apple Watch Ultra 2 GPS + Cellular, 49mm Titanium Case.", rating: 5, specs: { CaseSize: "49mm", BatteryLife: "Up to 36 hours" } },
        { name: "Dell XPS 15 9530", price: 18500, oldPrice: 21000, category: "Laptops", tag: "Featured", brand: "Dell", img: "/dell_xps.png", stock: 5, description: "Dell XPS 15 9530 Laptop, 15.6-inch OLED Touchscreen.", rating: 5, specs: { Processor: "Intel Core i9-13900H", RAM: "32GB DDR5", Storage: "1TB SSD", Graphics: "RTX 4060 8GB" } },
        { name: "Bose QuietComfort Ultra", price: 4900, oldPrice: 5500, category: "Audio & Sound", tag: "New Arrival", brand: "Bose", img: "/bose_headphones.png", stock: 12, description: "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones.", rating: 5, specs: { Type: "Over-Ear Wireless", ANC: "World-class", PlaybackTime: "Up to 24 hours" } },
        { name: "Google Pixel 8 Pro", price: 9200, oldPrice: 10500, category: "Smartphones", tag: "New Arrival", brand: "Google", img: "/pixel_8_pro.png", stock: 8, description: "Google Pixel 8 Pro, 128GB ROM, 12GB RAM, Obsidian.", rating: 5, specs: { Processor: "Google Tensor G3", Screen: "6.7-inch Super Actua", Storage: "128GB", Camera: "50MP Triple System" } }
      ]);
      console.log('✅ Products seeded successfully.');
    } else {
      console.log(`✅ Products already exist (${productCount}), skipping seed.`);
    }

    const adminExists = await User.findOne({ email: 'ben@technova.gh' }).select('+password');
    if (!adminExists) {
      console.log('🌱 Seeding admin user...');
      await User.create({
        name: "Bernard Ofori",
        email: "ben@technova.gh",
        password: "Bentech@12",
        role: "admin"
      });
      console.log('✅ Admin user seeded successfully.');
    } else {
      console.log('✅ Admin user already exists.');
      if (!adminExists.password || !adminExists.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash('Bentech@12', 12);
        await User.findByIdAndUpdate(adminExists._id, { password: hashedPassword });
        console.log('✅ Admin password re-hashed.');
      }
    }
  } catch (err) {
    console.error('Auto-seed exception:', err.message);
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "Healthy", message: "Ben-TechNova-Ghana API Gateway", timestamp: new Date() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Resource Not Found - [${req.method}] ${req.originalUrl}` });
});

// Error Handler
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