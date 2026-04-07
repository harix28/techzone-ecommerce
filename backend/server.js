const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const allowedOrigins = (process.env.FRONTEND_URLS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isVercelPreview = hostname === 'vercel.app' || hostname.endsWith('.vercel.app');
    const isConfiguredOrigin = allowedOrigins.some((allowedOrigin) => {
      try {
        return new URL(allowedOrigin).origin === origin;
      } catch {
        return false;
      }
    });

    return isLocalhost || isVercelPreview || isConfiguredOrigin;
  } catch {
    return false;
  }
};

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connect (cached for serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('✅ MongoDB connected!');
};

// Connect DB before every request (serverless compatible)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Disabled legacy seed route. Keep database seeding limited to explicit scripts.
app.get('/api/run-seed', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});
/*
try {
    const User = require('./models/User');
    const Category = require('./models/Category');
    const Product = require('./models/Product');

    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    await User.create({ name: 'Admin User', email: 'admin@techzone.com', password: 'admin123', role: 'admin' });
    await User.create({ name: 'John Doe', email: 'user@techzone.com', password: 'user123', role: 'user' });

    const categories = await Category.insertMany([
      { name: 'Smartphones', slug: 'smartphones', icon: '📱', description: 'Latest smartphones and mobile devices', order: 1 },
      { name: 'Laptops', slug: 'laptops', icon: '💻', description: 'High-performance laptops and ultrabooks', order: 2 },
      { name: 'Tablets', slug: 'tablets', icon: '📟', description: 'Tablets and iPads', order: 3 },
      { name: 'Audio', slug: 'audio', icon: '🎧', description: 'Headphones, speakers, and audio equipment', order: 4 },
      { name: 'Smart Watches', slug: 'smartwatches', icon: '⌚', description: 'Smartwatches and fitness trackers', order: 5 },
      { name: 'Cameras', slug: 'cameras', icon: '📷', description: 'Digital cameras and accessories', order: 6 },
      { name: 'Gaming', slug: 'gaming', icon: '🎮', description: 'Gaming consoles, accessories and peripherals', order: 7 },
      { name: 'Accessories', slug: 'accessories', icon: '🔌', description: 'Cables, chargers, cases and more', order: 8 }
    ]);

    const [smartphones, laptops, tablets, audio, watches, cameras, gaming, accessories] = categories;

    await Product.insertMany([
      { name: 'iPhone 15 Pro Max', description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and a stunning 6.7-inch Super Retina XDR display.', shortDescription: 'A17 Pro chip, titanium, 48MP camera system', price: 1199, originalPrice: 1299, category: smartphones._id, brand: 'Apple', images: ['https://picsum.photos/seed/iphone15/600/600'], stock: 45, sku: 'APPL-IP15PM-256', specifications: [{ key: 'Display', value: '6.7" Super Retina XDR' }, { key: 'Chip', value: 'A17 Pro' }], features: ['Face ID', 'USB-C', 'Always-On Display'], rating: 4.8, numReviews: 124, isFeatured: true, sold: 234, warranty: '1 Year Apple Warranty', tags: ['apple', 'iphone', '5g'] },
      { name: 'Samsung Galaxy S24 Ultra', description: 'Built-in S Pen, 200MP camera, and Snapdragon 8 Gen 3.', shortDescription: 'Built-in S Pen, 200MP, Snapdragon 8 Gen 3', price: 1099, originalPrice: 1199, category: smartphones._id, brand: 'Samsung', images: ['https://picsum.photos/seed/sams24/600/600'], stock: 32, sku: 'SAMS-GS24U-256', features: ['S Pen Included', '45W Fast Charging', 'IP68'], rating: 4.7, numReviews: 89, isFeatured: true, sold: 178, warranty: '1 Year Samsung Warranty', tags: ['samsung', 'galaxy'] },
      { name: 'Google Pixel 8 Pro', description: 'The smartest Pixel phone with Google AI.', shortDescription: 'Google AI, 7 years of updates, 50MP camera', price: 899, originalPrice: 999, category: smartphones._id, brand: 'Google', images: ['https://picsum.photos/seed/pixel8/600/600'], stock: 28, sku: 'GOOG-P8P-128', features: ['Magic Eraser', 'Temperature Sensor'], rating: 4.6, numReviews: 67, isFeatured: false, sold: 145, warranty: '1 Year Google Warranty', tags: ['google', 'pixel'] },
      { name: 'MacBook Pro 16" M3 Max', description: 'The ultimate pro laptop with M3 Max chip.', shortDescription: 'M3 Max chip, 36GB unified memory', price: 3499, originalPrice: 3699, category: laptops._id, brand: 'Apple', images: ['https://picsum.photos/seed/mbp16/600/600'], stock: 15, sku: 'APPL-MBP16-M3MAX', features: ['ProMotion 120Hz', 'MagSafe 3', 'Thunderbolt 4'], rating: 4.9, numReviews: 56, isFeatured: true, sold: 89, warranty: '1 Year AppleCare', tags: ['apple', 'macbook'] },
      { name: 'Dell XPS 15', description: 'Intel Core i9, NVIDIA RTX 4070, and OLED display.', shortDescription: 'Intel i9, RTX 4070, 15.6" OLED touch', price: 2299, originalPrice: 2499, category: laptops._id, brand: 'Dell', images: ['https://picsum.photos/seed/dellxps/600/600'], stock: 22, sku: 'DELL-XPS15-i9', features: ['Thunderbolt 4', 'Backlit Keyboard'], rating: 4.6, numReviews: 43, isFeatured: true, sold: 67, warranty: '1 Year Dell Warranty', tags: ['dell', 'xps'] },
      { name: 'ASUS ROG Zephyrus G14', description: 'Compact gaming powerhouse with AMD Ryzen 9, RTX 4090.', shortDescription: 'Ryzen 9, RTX 4090, AniMe Matrix display', price: 1999, originalPrice: 2199, category: laptops._id, brand: 'ASUS', images: ['https://picsum.photos/seed/asusrog/600/600'], stock: 18, sku: 'ASUS-ROG-G14-R9', features: ['AniMe Matrix Display', '240Hz QHD'], rating: 4.7, numReviews: 38, isFeatured: false, sold: 92, warranty: '1 Year ASUS Warranty', tags: ['asus', 'rog', 'gaming'] },
      { name: 'Sony WH-1000XM5', description: 'Industry-leading noise canceling headphones.', shortDescription: 'Best-in-class ANC, 30hr battery, LDAC', price: 349, originalPrice: 399, category: audio._id, brand: 'Sony', images: ['https://picsum.photos/seed/sonywh/600/600'], stock: 67, sku: 'SONY-WH1000XM5', features: ['Best ANC', 'Multipoint Connection'], rating: 4.8, numReviews: 234, isFeatured: true, sold: 456, warranty: '1 Year Sony Warranty', tags: ['sony', 'headphones'] },
      { name: 'Apple AirPods Pro 2nd Gen', description: 'Next-level ANC, Adaptive Audio, and USB-C charging.', shortDescription: 'H2 chip, Adaptive Transparency, USB-C', price: 249, category: audio._id, brand: 'Apple', images: ['https://picsum.photos/seed/airpodspro/600/600'], stock: 89, sku: 'APPL-APP2-USBC', features: ['Adaptive Audio', 'Spatial Audio', 'MagSafe'], rating: 4.7, numReviews: 312, isFeatured: true, sold: 789, warranty: '1 Year Apple Warranty', tags: ['apple', 'airpods'] },
      { name: 'JBL Charge 5', description: 'Portable Bluetooth speaker with 20-hour battery.', shortDescription: '20hr battery, IP67, power bank function', price: 149, originalPrice: 179, category: audio._id, brand: 'JBL', images: ['https://picsum.photos/seed/jblcharge/600/600'], stock: 54, sku: 'JBL-CHG5-BLK', features: ['Powerbank', 'IP67 Waterproof'], rating: 4.5, numReviews: 167, isFeatured: false, sold: 321, warranty: '1 Year JBL Warranty', tags: ['jbl', 'speaker'] },
      { name: 'Apple Watch Ultra 2', description: 'Most rugged Apple Watch for extreme sports.', shortDescription: 'Titanium, dual GPS, 60hr battery', price: 799, category: watches._id, brand: 'Apple', images: ['https://picsum.photos/seed/awultra/600/600'], stock: 23, sku: 'APPL-AWU2-TIT', features: ['Dual GPS', 'Action Button', 'Siren'], rating: 4.8, numReviews: 78, isFeatured: true, sold: 123, warranty: '1 Year Apple Warranty', tags: ['apple', 'watch'] },
      { name: 'Samsung Galaxy Watch 6 Classic', description: 'Classic design with rotating bezel and health tracking.', shortDescription: 'Rotating bezel, BioActive sensor', price: 349, originalPrice: 399, category: watches._id, brand: 'Samsung', images: ['https://picsum.photos/seed/gwatch6/600/600'], stock: 41, sku: 'SAMS-GW6C-47MM', features: ['Rotating Bezel', 'Sleep Coaching', 'ECG'], rating: 4.5, numReviews: 56, isFeatured: false, sold: 98, warranty: '1 Year Samsung Warranty', tags: ['samsung', 'smartwatch'] },
      { name: 'PlayStation 5 Console', description: 'Next generation gaming with ultra-high-speed SSD.', shortDescription: 'DualSense, 825GB SSD, 4K/120fps gaming', price: 499, category: gaming._id, brand: 'Sony', images: ['https://picsum.photos/seed/ps5/600/600'], stock: 12, sku: 'SONY-PS5-DISC', features: ['DualSense Haptics', 'Adaptive Triggers', 'Ray Tracing'], rating: 4.9, numReviews: 456, isFeatured: true, sold: 234, warranty: '1 Year Sony Warranty', tags: ['sony', 'playstation'] },
      { name: 'Razer BlackWidow V4 Pro', description: 'Flagship mechanical gaming keyboard with Razer Yellow switches.', shortDescription: 'Yellow switches, wireless, Chroma RGB', price: 249, originalPrice: 279, category: gaming._id, brand: 'Razer', images: ['https://picsum.photos/seed/razerkb/600/600'], stock: 35, sku: 'RAZR-BW4P-YEL', features: ['HyperSpeed Wireless', 'Chroma RGB'], rating: 4.6, numReviews: 89, isFeatured: false, sold: 145, warranty: '1 Year Razer Warranty', tags: ['razer', 'keyboard'] },
      { name: 'Anker 737 Power Bank', description: '24,000mAh power bank with 140W output.', shortDescription: '24000mAh, 140W, 3-port charging', price: 149, originalPrice: 179, category: accessories._id, brand: 'Anker', images: ['https://picsum.photos/seed/anker737/600/600'], stock: 78, sku: 'ANKR-737-24K', features: ['140W USB-C', 'Smart Display'], rating: 4.7, numReviews: 234, isFeatured: false, sold: 567, warranty: '2 Year Anker Warranty', tags: ['anker', 'power bank'] },
      { name: 'Samsung 49" Odyssey G9 OLED', description: 'Ultimate curved gaming monitor with OLED and 240Hz.', shortDescription: '49" OLED, 240Hz, 32:9, G-Sync & FreeSync', price: 1499, originalPrice: 1799, category: accessories._id, brand: 'Samsung', images: ['https://picsum.photos/seed/odysseyg9/600/600'], stock: 8, sku: 'SAMS-ODY-G9-49', features: ['G-Sync Ultimate', 'AMD FreeSync', '1800R Curve'], rating: 4.8, numReviews: 45, isFeatured: true, sold: 67, warranty: '3 Year Samsung Warranty', tags: ['samsung', 'monitor'] }
    ]);

    res.json({ message: '✅ All data seeded! Users, Categories & Products created.' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TechZone API Running' }));

// Local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  });
}

module.exports = app;
