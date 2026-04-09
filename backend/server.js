const app = require('./bootstrap');

module.exports = app;
/*
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- 1. CORS Configuration ---
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allows tools like Postman/ThunderClient
  try {
    const { hostname } = new URL(origin);
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isVercel = hostname.endsWith('.vercel.app');
    
    const isConfigured = allowedOrigins.some((allowed) => {
      try { return new URL(allowed).origin === origin; } catch { return false; }
    });

    return isLocalhost || isVercel || isConfigured;
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// --- 2. Middleware ---
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. Database Connection ---
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
 await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  // This tells MongoDB to connect via the standard web port 443
  // which bypasses most network blocks
  proxyHost: 'http', 
});
    isConnected = true;
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    // This will give us more detail in the terminal
    console.log("Full Error Context:", err.reason ? err.reason : err);
  }
};

// --- 4. Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    dbConnected: isConnected,
    environment: process.env.NODE_ENV 
  });
});

// --- 5. Global Error Handling (Important!) ---
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`🚩 Error: ${err.message}`);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// --- 6. Server Initialization ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
});

module.exports = app;
*/
