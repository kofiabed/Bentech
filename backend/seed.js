const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ben_technova_ghana';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Database connected');

    const User = require('./models/userModel');
    const Product = require('./models/productModel');

    // Seed products (only if collection is empty)
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
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
    } else {
      console.log(`Products already exist (${productCount}), skipping seed`);
    }

    // Seed admin user (update password if exists, create if not)
    const adminExists = await User.findOne({ email: 'ben@technova.gh' }).select('+password');
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Bentech@12', 12);
      await User.create({ name: "Bernard Ofori", email: "ben@technova.gh", password: hashedPassword, role: "admin" });
      console.log('Admin seeded');
    } else if (!adminExists.password || !adminExists.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash('Bentech@12', 12);
      await User.findByIdAndUpdate(adminExists._id, { password: hashedPassword });
      console.log('Admin password rehashed');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();