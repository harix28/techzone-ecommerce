const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/techzone');
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@techzone.com',
    password: 'admin123',
    role: 'admin'
  });

  // Create regular user
  const user = await User.create({
    name: 'John Doe',
    email: 'user@techzone.com',
    password: 'user123',
    role: 'user'
  });

  console.log('✅ Users created');
  console.log('   Admin: admin@techzone.com / admin123');
  console.log('   User:  user@techzone.com / user123');

  // Create categories
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
  console.log('✅ Categories created');

  // Create products with placeholder images (using picsum.photos)
  const products = await Product.insertMany([
    // Smartphones
    {
      name: 'iPhone 15 Pro Max',
      description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and a stunning 6.7-inch Super Retina XDR display.',
      shortDescription: 'A17 Pro chip, titanium, 48MP camera system',
      price: 1199, originalPrice: 1299,
      category: smartphones._id, brand: 'Apple',
      images: ['https://picsum.photos/seed/iphone15/600/600', 'https://picsum.photos/seed/iphone15b/600/600'],
      stock: 45, sku: 'APPL-IP15PM-256',
      specifications: [
        { key: 'Display', value: '6.7" Super Retina XDR' },
        { key: 'Chip', value: 'A17 Pro' },
        { key: 'Storage', value: '256GB' },
        { key: 'Camera', value: '48MP + 12MP + 12MP' },
        { key: 'Battery', value: '4422mAh' }
      ],
      features: ['Face ID', 'USB-C', 'Always-On Display', 'ProMotion 120Hz'],
      rating: 4.8, numReviews: 124, isFeatured: true, sold: 234,
      warranty: '1 Year Apple Warranty', tags: ['apple', 'iphone', '5g', 'flagship']
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'The pinnacle of Samsung mobile technology. Featuring a built-in S Pen, 200MP camera, and Snapdragon 8 Gen 3.',
      shortDescription: 'Built-in S Pen, 200MP, Snapdragon 8 Gen 3',
      price: 1099, originalPrice: 1199,
      category: smartphones._id, brand: 'Samsung',
      images: ['https://picsum.photos/seed/sams24/600/600'],
      stock: 32, sku: 'SAMS-GS24U-256',
      specifications: [
        { key: 'Display', value: '6.8" Dynamic AMOLED 2X' },
        { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { key: 'Storage', value: '256GB' },
        { key: 'Camera', value: '200MP quad camera' },
        { key: 'Battery', value: '5000mAh' }
      ],
      features: ['S Pen Included', '45W Fast Charging', 'IP68', 'AI Features'],
      rating: 4.7, numReviews: 89, isFeatured: true, sold: 178,
      warranty: '1 Year Samsung Warranty', tags: ['samsung', 'galaxy', 's-pen', 'android']
    },
    {
      name: 'Google Pixel 8 Pro',
      description: 'The smartest Pixel phone with Google AI, a stunning camera system, and 7 years of OS updates.',
      shortDescription: 'Google AI, 7 years of updates, 50MP camera',
      price: 899, originalPrice: 999,
      category: smartphones._id, brand: 'Google',
      images: ['https://picsum.photos/seed/pixel8/600/600'],
      stock: 28, sku: 'GOOG-P8P-128',
      specifications: [
        { key: 'Display', value: '6.7" LTPO OLED' },
        { key: 'Processor', value: 'Google Tensor G3' },
        { key: 'Storage', value: '128GB' },
        { key: 'Camera', value: '50MP + 48MP + 48MP' }
      ],
      features: ['Magic Eraser', 'Temperature Sensor', 'Face Unblur', 'Call Screen'],
      rating: 4.6, numReviews: 67, isFeatured: false, sold: 145,
      warranty: '1 Year Google Warranty', tags: ['google', 'pixel', 'android']
    },
    // Laptops
    {
      name: 'MacBook Pro 16" M3 Max',
      description: 'The ultimate pro laptop with M3 Max chip, Liquid Retina XDR display, and up to 22 hours of battery life.',
      shortDescription: 'M3 Max chip, 36GB unified memory, 16" Liquid Retina XDR',
      price: 3499, originalPrice: 3699,
      category: laptops._id, brand: 'Apple',
      images: ['https://picsum.photos/seed/mbp16/600/600'],
      stock: 15, sku: 'APPL-MBP16-M3MAX',
      specifications: [
        { key: 'Processor', value: 'Apple M3 Max' },
        { key: 'Memory', value: '36GB Unified Memory' },
        { key: 'Storage', value: '1TB SSD' },
        { key: 'Display', value: '16.2" Liquid Retina XDR' },
        { key: 'Battery', value: '22 hours' }
      ],
      features: ['ProMotion 120Hz', 'MagSafe 3', 'Thunderbolt 4', 'HDMI 2.1'],
      rating: 4.9, numReviews: 56, isFeatured: true, sold: 89,
      warranty: '1 Year AppleCare', tags: ['apple', 'macbook', 'laptop', 'pro']
    },
    {
      name: 'Dell XPS 15',
      description: 'The ultimate Windows laptop with Intel Core i9, NVIDIA RTX 4070, and a stunning OLED display.',
      shortDescription: 'Intel i9, RTX 4070, 15.6" OLED touch',
      price: 2299, originalPrice: 2499,
      category: laptops._id, brand: 'Dell',
      images: ['https://picsum.photos/seed/dellxps/600/600'],
      stock: 22, sku: 'DELL-XPS15-i9',
      specifications: [
        { key: 'Processor', value: 'Intel Core i9-13900H' },
        { key: 'GPU', value: 'NVIDIA RTX 4070 8GB' },
        { key: 'RAM', value: '32GB DDR5' },
        { key: 'Storage', value: '1TB NVMe SSD' },
        { key: 'Display', value: '15.6" 3.5K OLED Touch' }
      ],
      features: ['Thunderbolt 4', 'Backlit Keyboard', 'Fingerprint Reader', 'WiFi 6E'],
      rating: 4.6, numReviews: 43, isFeatured: true, sold: 67,
      warranty: '1 Year Dell Warranty', tags: ['dell', 'xps', 'laptop', 'windows']
    },
    {
      name: 'ASUS ROG Zephyrus G14',
      description: 'Compact gaming powerhouse with AMD Ryzen 9, RTX 4090, and an AniMe Matrix LED display.',
      shortDescription: 'Ryzen 9, RTX 4090, AniMe Matrix display',
      price: 1999, originalPrice: 2199,
      category: laptops._id, brand: 'ASUS',
      images: ['https://picsum.photos/seed/asusrog/600/600'],
      stock: 18, sku: 'ASUS-ROG-G14-R9',
      specifications: [
        { key: 'Processor', value: 'AMD Ryzen 9 7945HX' },
        { key: 'GPU', value: 'NVIDIA RTX 4090 16GB' },
        { key: 'RAM', value: '32GB DDR5' },
        { key: 'Storage', value: '1TB NVMe SSD' }
      ],
      features: ['AniMe Matrix Display', '240Hz QHD', 'MUX Switch', 'ROG Boost'],
      rating: 4.7, numReviews: 38, isFeatured: false, sold: 92,
      warranty: '1 Year ASUS Warranty', tags: ['asus', 'rog', 'gaming', 'laptop']
    },
    // Audio
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling headphones with exceptional sound quality and 30-hour battery life.',
      shortDescription: 'Best-in-class ANC, 30hr battery, LDAC',
      price: 349, originalPrice: 399,
      category: audio._id, brand: 'Sony',
      images: ['https://picsum.photos/seed/sonywh/600/600'],
      stock: 67, sku: 'SONY-WH1000XM5',
      specifications: [
        { key: 'Type', value: 'Over-ear Wireless' },
        { key: 'Driver', value: '30mm' },
        { key: 'Battery', value: '30 hours' },
        { key: 'Bluetooth', value: '5.2' },
        { key: 'Weight', value: '250g' }
      ],
      features: ['Best ANC', 'Multipoint Connection', 'Speak-to-Chat', 'DSEE Extreme'],
      rating: 4.8, numReviews: 234, isFeatured: true, sold: 456,
      warranty: '1 Year Sony Warranty', tags: ['sony', 'headphones', 'anc', 'wireless']
    },
    {
      name: 'Apple AirPods Pro 2nd Gen',
      description: 'The world\'s most popular wireless earbuds with next-level ANC, Adaptive Audio, and USB-C charging.',
      shortDescription: 'H2 chip, Adaptive Transparency, USB-C',
      price: 249,
      category: audio._id, brand: 'Apple',
      images: ['https://picsum.photos/seed/airpodspro/600/600'],
      stock: 89, sku: 'APPL-APP2-USBC',
      specifications: [
        { key: 'Type', value: 'In-ear True Wireless' },
        { key: 'Chip', value: 'Apple H2' },
        { key: 'Battery', value: '6hr + 30hr (case)' },
        { key: 'Connectivity', value: 'Bluetooth 5.3' }
      ],
      features: ['Adaptive Audio', 'Personalized Spatial Audio', 'Conversation Awareness', 'MagSafe'],
      rating: 4.7, numReviews: 312, isFeatured: true, sold: 789,
      warranty: '1 Year Apple Warranty', tags: ['apple', 'airpods', 'tws', 'earbuds']
    },
    {
      name: 'JBL Charge 5',
      description: 'Portable Bluetooth speaker with massive sound, 20-hour battery, and power bank functionality.',
      shortDescription: '20hr battery, IP67, power bank function',
      price: 149, originalPrice: 179,
      category: audio._id, brand: 'JBL',
      images: ['https://picsum.photos/seed/jblcharge/600/600'],
      stock: 54, sku: 'JBL-CHG5-BLK',
      specifications: [
        { key: 'Output Power', value: '30W' },
        { key: 'Battery Life', value: '20 hours' },
        { key: 'Waterproofing', value: 'IP67' },
        { key: 'Bluetooth', value: '5.1' }
      ],
      features: ['Powerbank', 'PartyBoost', 'IP67 Waterproof', 'USB-C Charging'],
      rating: 4.5, numReviews: 167, isFeatured: false, sold: 321,
      warranty: '1 Year JBL Warranty', tags: ['jbl', 'speaker', 'bluetooth', 'portable']
    },
    // Smart Watches
    {
      name: 'Apple Watch Ultra 2',
      description: 'The most rugged and capable Apple Watch ever, built for extreme sports and adventures.',
      shortDescription: 'Titanium, dual GPS, 60hr battery, 49mm',
      price: 799,
      category: watches._id, brand: 'Apple',
      images: ['https://picsum.photos/seed/awultra/600/600'],
      stock: 23, sku: 'APPL-AWU2-TIT',
      specifications: [
        { key: 'Case Material', value: 'Titanium' },
        { key: 'Display', value: '49mm LTPO OLED' },
        { key: 'Battery', value: '60 hours' },
        { key: 'Water Resistance', value: '100m' }
      ],
      features: ['Dual GPS', 'Action Button', 'Siren', 'Depth Gauge'],
      rating: 4.8, numReviews: 78, isFeatured: true, sold: 123,
      warranty: '1 Year Apple Warranty', tags: ['apple', 'watch', 'smartwatch', 'ultra']
    },
    {
      name: 'Samsung Galaxy Watch 6 Classic',
      description: 'Classic design meets modern smartwatch technology with rotating bezel and comprehensive health tracking.',
      shortDescription: 'Rotating bezel, BioActive sensor, 2-day battery',
      price: 349, originalPrice: 399,
      category: watches._id, brand: 'Samsung',
      images: ['https://picsum.photos/seed/gwatch6/600/600'],
      stock: 41, sku: 'SAMS-GW6C-47MM',
      specifications: [
        { key: 'Display', value: '47mm Super AMOLED' },
        { key: 'Battery', value: '425mAh' },
        { key: 'OS', value: 'Wear OS + One UI' },
        { key: 'Water Resistance', value: '5ATM + IP68' }
      ],
      features: ['Rotating Bezel', 'Sleep Coaching', 'Body Composition', 'ECG'],
      rating: 4.5, numReviews: 56, isFeatured: false, sold: 98,
      warranty: '1 Year Samsung Warranty', tags: ['samsung', 'galaxy', 'smartwatch']
    },
    // Gaming
    {
      name: 'PlayStation 5 Console',
      description: 'Experience the next generation of gaming with the PS5. Ultra-high-speed SSD, haptic feedback, and 4K gaming.',
      shortDescription: 'DualSense, 825GB SSD, 4K/120fps gaming',
      price: 499,
      category: gaming._id, brand: 'Sony',
      images: ['https://picsum.photos/seed/ps5/600/600'],
      stock: 12, sku: 'SONY-PS5-DISC',
      specifications: [
        { key: 'CPU', value: 'AMD Zen 2 8-core' },
        { key: 'GPU', value: 'AMD RDNA 2 10.28 TFLOPS' },
        { key: 'RAM', value: '16GB GDDR6' },
        { key: 'Storage', value: '825GB Custom SSD' },
        { key: 'Resolution', value: 'Up to 8K' }
      ],
      features: ['DualSense Haptics', 'Adaptive Triggers', 'Ray Tracing', '3D Audio'],
      rating: 4.9, numReviews: 456, isFeatured: true, sold: 234,
      warranty: '1 Year Sony Warranty', tags: ['sony', 'playstation', 'gaming', 'console']
    },
    {
      name: 'Razer BlackWidow V4 Pro',
      description: 'Flagship mechanical gaming keyboard with Razer Yellow switches, HyperSpeed Wireless, and Chroma RGB.',
      shortDescription: 'Yellow switches, wireless, Chroma RGB, wrist rest',
      price: 249, originalPrice: 279,
      category: gaming._id, brand: 'Razer',
      images: ['https://picsum.photos/seed/razerkb/600/600'],
      stock: 35, sku: 'RAZR-BW4P-YEL',
      specifications: [
        { key: 'Switch Type', value: 'Razer Yellow (Linear)' },
        { key: 'Connectivity', value: 'Wireless + USB-C' },
        { key: 'Battery', value: '200 hours' },
        { key: 'Layout', value: 'Full Size' }
      ],
      features: ['HyperSpeed Wireless', 'Chroma RGB', 'Magnetic Wrist Rest', 'Multi-device'],
      rating: 4.6, numReviews: 89, isFeatured: false, sold: 145,
      warranty: '1 Year Razer Warranty', tags: ['razer', 'keyboard', 'gaming', 'mechanical']
    },
    // Accessories
    {
      name: 'Anker 737 Power Bank',
      description: '24,000mAh power bank with 140W output. Charge your MacBook Pro and phone simultaneously.',
      shortDescription: '24000mAh, 140W, 3-port charging',
      price: 149, originalPrice: 179,
      category: accessories._id, brand: 'Anker',
      images: ['https://picsum.photos/seed/anker737/600/600'],
      stock: 78, sku: 'ANKR-737-24K',
      specifications: [
        { key: 'Capacity', value: '24,000mAh' },
        { key: 'Max Output', value: '140W' },
        { key: 'Ports', value: '2x USB-C, 1x USB-A' },
        { key: 'Weight', value: '636g' }
      ],
      features: ['140W USB-C', 'Smart Display', 'Bi-directional charging', 'Airline approved'],
      rating: 4.7, numReviews: 234, isFeatured: false, sold: 567,
      warranty: '2 Year Anker Warranty', tags: ['anker', 'power bank', 'charging', 'portable']
    },
    {
      name: 'Samsung 49" Odyssey G9 OLED',
      description: 'The ultimate curved gaming monitor. OLED, 240Hz, and a super-ultrawide 32:9 aspect ratio.',
      shortDescription: '49" OLED, 240Hz, 32:9, G-Sync & FreeSync',
      price: 1499, originalPrice: 1799,
      category: accessories._id, brand: 'Samsung',
      images: ['https://picsum.photos/seed/odysseyg9/600/600'],
      stock: 8, sku: 'SAMS-ODY-G9-49',
      specifications: [
        { key: 'Panel', value: 'QD-OLED' },
        { key: 'Size', value: '49"' },
        { key: 'Resolution', value: '5120 x 1440' },
        { key: 'Refresh Rate', value: '240Hz' },
        { key: 'Response Time', value: '0.03ms' }
      ],
      features: ['G-Sync Ultimate', 'AMD FreeSync Premium Pro', 'DisplayHDR True Black 400', '1800R Curve'],
      rating: 4.8, numReviews: 45, isFeatured: true, sold: 67,
      warranty: '3 Year Samsung Warranty', tags: ['samsung', 'monitor', 'gaming', 'ultrawide']
    }
  ]);

  console.log('✅ Products created:', products.length, 'products');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@techzone.com / admin123');
  console.log('  User:  user@techzone.com / user123');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});