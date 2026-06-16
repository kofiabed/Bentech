// ==========================================
// BEN-TECHNOVA-GHANA BACKEND SERVER ENGINE
// ==========================================

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fix DNS resolution for MongoDB Atlas SRV records

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Initialize the Express Application
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// GLOBAL MIDDLEWARE PIPELINE
// ==========================================

// 1. Cross-Origin Resource Sharing (Allows your Vite web client to communicate safely)
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
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list or is a local address
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocal) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

// 2. Built-in Body Parsers (Replaces old body-parser packages)
app.use(express.json({ limit: '25mb' })); // Parses incoming JSON application payloads
app.use(express.urlencoded({ extended: true, limit: '25mb' })); // Parses URL-encoded form data

// ==========================================
// DATABASE CONNECTION & SEED CONFIGURATION
// ==========================================
const MONGO_URI = 'mongodb://127.0.0.1:27017/ben_technova_ghana';
const User = require('./models/userModel'); // 💡 SECURE REQUIRE: Hooks user schema parameters
const Product = require('./models/productModel');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('🚀 Database layer synchronized and connected successfully.');
    
    try {
      await User.deleteOne({ email: 'admin@technova.gh' });
      await User.deleteOne({ email: 'ben@technova.gh' });
      console.log('🗑️ Old admin users removed.');

      // Clear old products to ensure fresh seeding matches expanded catalog
      await Product.deleteMany({});
      console.log('🌱 Seeding expanded premium products into database...');
      await Product.insertMany([
        {
          name: "HP ProBook 450 G10",
          price: 9500,
          oldPrice: 11000,
          category: "Laptops",
          tag: "Best Seller",
          brand: "HP",
          img: "/hp_probook.png",
          stock: 15,
          description: "HP ProBook 450 G10 Laptop, 15.6 inch Display, Intel Core i7 13th Gen, 16GB DDR4 RAM, 512GB NVMe SSD, Windows 11 Pro. Perfect business laptop.",
          rating: 5,
          specs: { Processor: "Intel Core i7-1355U", RAM: "16GB DDR4", Storage: "512GB SSD PCIe NVMe", OS: "Windows 11 Pro" }
        },
        {
          name: "Apple MacBook Air M3",
          price: 14500,
          oldPrice: 16000,
          category: "Laptops",
          tag: "Featured",
          brand: "Apple",
          img: "/macbook_air.png",
          stock: 8,
          description: "Apple MacBook Air 13.6-inch with M3 chip, 8GB Unified Memory, 256GB SSD storage, backlit keyboard, Touch ID. Midnight color, sleek & portable.",
          rating: 5,
          specs: { Processor: "Apple M3 Chip", RAM: "8GB Unified Memory", Storage: "256GB SSD", ScreenSize: "13.6-inch Liquid Retina" }
        },
        {
          name: "Samsung Galaxy S24 Ultra",
          price: 13800,
          oldPrice: 15000,
          category: "Smartphones",
          tag: "Flash Sale",
          brand: "Samsung",
          img: "/s24_ultra.png",
          stock: 12,
          description: "Samsung Galaxy S24 Ultra 5G, 256GB ROM, 12GB RAM, Titanium Gray, AI powered features, Quad camera, with S-Pen.",
          rating: 5,
          specs: { Screen: "6.8-inch Dynamic AMOLED 2X", RAM: "12GB", Storage: "256GB", Camera: "200MP + 50MP + 12MP + 10MP" }
        },
        {
          name: "iPhone 15 Pro Max",
          price: 14200,
          oldPrice: 15500,
          category: "Smartphones",
          tag: "Best Seller",
          brand: "Apple",
          img: "/iphone_15.png",
          stock: 10,
          description: "Apple iPhone 15 Pro Max, 256GB, Titanium Blue. 48MP main camera, Action button, USB-C connector.",
          rating: 5,
          specs: { Processor: "A17 Pro chip", Screen: "6.7-inch Super Retina XDR", Storage: "256GB", Camera: "48MP Main" }
        },
        {
          name: "Sony WH-1000XM5",
          price: 4200,
          oldPrice: 4800,
          category: "Audio & Sound",
          tag: "Featured",
          brand: "Sony",
          img: "/sony_headphones.png",
          stock: 20,
          description: "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones, Auto NC Optimizer, crystal clear hands-free calling, black.",
          rating: 5,
          specs: { Type: "Over-Ear Wireless", BatteryLife: "Up to 30 hours", NoiseCancelling: "Yes", VoiceAssistant: "Google & Alexa Built-in" }
        },
        {
          name: "Apple AirPods Pro Gen 2",
          price: 2600,
          oldPrice: 3000,
          category: "Audio & Sound",
          tag: "Flash Sale",
          brand: "Apple",
          img: "/airpods_pro.png",
          stock: 25,
          description: "Apple AirPods Pro (2nd Generation) Wireless Earbuds, Active Noise Cancellation, Adaptive Audio, Transparency Mode, MagSafe Charger.",
          rating: 5,
          specs: { Type: "In-Ear Wireless", Chip: "Apple H2", NoiseCancelling: "Yes", Charging: "USB-C MagSafe Case" }
        },
        {
          name: "Quantum Smart Watch V2",
          price: 750,
          oldPrice: 950,
          category: "Wearables",
          tag: "Featured",
          brand: "Quantum",
          img: "/quantum_watch.png",
          stock: 30,
          description: "Quantum Smart Watch V2 with AMOLED Display, Bluetooth Calling, heart rate and blood oxygen monitoring, 100+ sports modes, waterproof.",
          rating: 4,
          specs: { Display: "1.43-inch AMOLED", BatteryLife: "Up to 7 days", Sensors: "Heart Rate, SpO2, Sleep", Waterproof: "IP68" }
        },
        {
          name: "Sony PlayStation 5 Slim",
          price: 6800,
          oldPrice: 7500,
          category: "Gaming",
          tag: "Best Seller",
          brand: "Sony",
          img: "/playstation_5.png",
          stock: 14,
          description: "PlayStation 5 Console - Slim Digital Edition. Experience lightning fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback. Also known as PS5 console.",
          rating: 5,
          specs: { Storage: "1TB Custom SSD", Controller: "DualSense Wireless Controller", Output: "4K 120Hz support", Edition: "Digital Slim" }
        },
        {
          name: "Logitech MX Master 3S",
          price: 1200,
          oldPrice: 1400,
          category: "Accessories",
          tag: "Featured",
          brand: "Logitech",
          img: "/logitech_mouse.png",
          stock: 18,
          description: "Logitech MX Master 3S Wireless Performance Mouse, 8K DPI tracking on any surface, quiet clicks, USB-C rechargeable, ergonomics.",
          rating: 5,
          specs: { Connectivity: "Bluetooth / Logi Bolt", DPI: "8000 max", Battery: "Rechargeable Li-Po (500 mAh)", Buttons: "7 buttons" }
        },
        {
          name: "Nintendo Switch OLED Model",
          price: 3900,
          oldPrice: 4500,
          category: "Gaming",
          tag: "Best Seller",
          brand: "Nintendo",
          img: "/nintendo_switch.png",
          stock: 10,
          description: "Nintendo Switch OLED Model with White Joy-Con. Vibrant 7-inch OLED screen, wide adjustable stand, wired LAN port, 64 GB internal storage.",
          rating: 5,
          specs: { Screen: "7-inch OLED", Storage: "64GB", Modes: "TV, Tabletop, Handheld" }
        },
        {
          name: "Apple Watch Ultra 2",
          price: 9800,
          oldPrice: 11000,
          category: "Wearables",
          tag: "Featured",
          brand: "Apple",
          img: "/apple_watch_ultra.png",
          stock: 6,
          description: "Apple Watch Ultra 2 GPS + Cellular, 49mm Titanium Case with Blue Ocean Band. Rugged sports watch with dual-frequency GPS, 36-hour battery life.",
          rating: 5,
          specs: { CaseSize: "49mm", Material: "Titanium", BatteryLife: "Up to 36 hours", Connectivity: "LTE + GPS" }
        },
        {
          name: "Dell XPS 15 9530",
          price: 18500,
          oldPrice: 21000,
          category: "Laptops",
          tag: "Featured",
          brand: "Dell",
          img: "/dell_xps.png",
          stock: 5,
          description: "Dell XPS 15 9530 Laptop, 15.6-inch OLED Touchscreen, Intel Core i9 13th Gen, 32GB RAM, 1TB SSD, NVIDIA GeForce RTX 4060, Windows 11 Pro.",
          rating: 5,
          specs: { Processor: "Intel Core i9-13900H", RAM: "32GB DDR5", Storage: "1TB SSD NVMe", Graphics: "RTX 4060 8GB" }
        },
        {
          name: "Bose QuietComfort Ultra",
          price: 4900,
          oldPrice: 5500,
          category: "Audio & Sound",
          tag: "New Arrival",
          brand: "Bose",
          img: "/bose_headphones.png",
          stock: 12,
          description: "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones, Spatial Audio, World-class ANC, CustomTune technology, Custom active sound profile.",
          rating: 5,
          specs: { Type: "Over-Ear Wireless", ANC: "World-class Custom", PlaybackTime: "Up to 24 hours" }
        },
        {
          name: "Google Pixel 8 Pro",
          price: 9200,
          oldPrice: 10500,
          category: "Smartphones",
          tag: "New Arrival",
          brand: "Google",
          img: "/pixel_8_pro.png",
          stock: 8,
          description: "Google Pixel 8 Pro, 128GB ROM, 12GB RAM, Obsidian. Unlocked Android Smartphone with Advanced Pixel Camera, Pro Controls, and Google AI.",
          rating: 5,
          specs: { Processor: "Google Tensor G3", Screen: "6.7-inch Super Actua", Storage: "128GB", Camera: "50MP Triple System" }
        }
      ]);
      console.log('✅ Expanded premium products seeded successfully.');

      // Ensure all existing product images are updated to real assets
      await Product.updateOne({ name: "HP ProBook 450 G10" }, { img: "/hp_probook.png" });
      await Product.updateOne({ name: "Apple MacBook Air M3" }, { img: "/macbook_air.png" });
      await Product.updateOne({ name: "Samsung Galaxy S24 Ultra" }, { img: "/s24_ultra.png" });
      await Product.updateOne({ name: "iPhone 15 Pro Max" }, { img: "/iphone_15.png" });
      await Product.updateOne({ name: "Sony WH-1000XM5" }, { img: "/sony_headphones.png" });
      await Product.updateOne({ name: "Apple AirPods Pro Gen 2" }, { img: "/airpods_pro.png" });
      await Product.updateOne({ name: "Quantum Smart Watch V2" }, { img: "/quantum_watch.png" });
      await Product.updateOne({ name: "Sony PlayStation 5 Slim" }, { img: "/playstation_5.png" });
      await Product.updateOne({ name: "Logitech MX Master 3S" }, { img: "/logitech_mouse.png" });
      await Product.updateOne({ name: "Nintendo Switch OLED Model" }, { img: "/nintendo_switch.png" });
      await Product.updateOne({ name: "Apple Watch Ultra 2" }, { img: "/apple_watch_ultra.png" });
      await Product.updateOne({ name: "Dell XPS 15 9530" }, { img: "/dell_xps.png" });
      await Product.updateOne({ name: "Bose QuietComfort Ultra" }, { img: "/bose_headphones.png" });
      await Product.updateOne({ name: "Google Pixel 8 Pro" }, { img: "/pixel_8_pro.png" });
      
      const adminExists = await User.findOne({ email: 'ben@technova.gh' }).select('+password');
      
      if (!adminExists) {
        console.log('🌱 Seeding administrative supervisor account into database...');
        await User.create({
          name: "Bernard Ofori",
          email: "ben@technova.gh",
          password: "Bentech@12",
          role: "admin"
        });
        console.log('✅ Admin seed complete. Node parameters persistent.');
      } else {
        console.log('🛡️ Security Registry: Admin structural node validated on boot.');
        if (!adminExists.password || !adminExists.password.startsWith('$2')) {
          console.log('🔑 Re-hashing plain text admin password...');
          const hashedPassword = await bcrypt.hash('Bentech@12', 12);
          await User.findByIdAndUpdate(adminExists._id, { password: hashedPassword });
          console.log('✅ Admin password re-hashed successfully.');
        }
      }
    } catch (seedErr) {
      console.error('⚠️ Auto-seed engine caught an exception:', seedErr.message);
    }
  })
  .catch((err) => console.error('❌ Critical Error: Database connection failed ->', err.message));

// Handle runtime database connection disruptions gracefully
mongoose.connection.on('error', err => {
  console.error('⚠️ Runtime database connection exception raised:', err);
});

// ==========================================
// API ENDPOINTS & ROUTING ARRAYS
// ==========================================

// Basic System Health / Pulse Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "Healthy",
    message: "Ben-TechNova-Ghana API Gateway is executing flawlessly.",
    timestamp: new Date()
  });
});

// Mount Core Application Interface APIs securely
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// ==========================================
// ACCESSIBLE GLOBAL ERROR HANDLING WARE
// ==========================================

// 404 Route Fallback Handler (If a requested endpoint doesn't exist)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource Endpoint Not Found - [${req.method}] ${req.originalUrl}`
  });
});

// Central Error Interceptor Middleware
app.use((err, req, res, next) => {
  console.error('💥 Stack Trace Exception Intercepted:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Runtime Exception",
    // Only expose full stack debug arrays while running inside development mode
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// ==========================================
// EXECUTE LISTENER PORT
// ==========================================
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ Core Engine running in [${process.env.NODE_ENV || 'development'}] configuration.`);
  console.log(`🚀 Gateway Server listening seamlessly on port: ${PORT}`);
  console.log(`====================================================`);
});