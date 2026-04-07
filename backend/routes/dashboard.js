const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const monthlyRevenuePipeline = [
  { $match: { status: { $ne: 'cancelled' } } },
  {
    $group: {
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      revenue: { $sum: '$totalAmount' },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } },
  { $limit: 12 },
  { $sort: { '_id.year': 1, '_id.month': 1 } }
];

const buildDashboardPayload = async () => {
  const [
    totalOrders,
    totalUsers,
    totalProducts,
    revenueData,
    recentOrders,
    lowStockProducts,
    ordersByStatus,
    topProducts,
    monthlyRevenue,
    outOfStock
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user', isActive: true }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
    Product.find({ stock: { $lte: 10 }, isActive: true }).select('name stock sku images').sort({ stock: 1 }).limit(10),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.find({ isActive: true }).select('name images sold price').sort({ sold: -1, createdAt: -1 }).limit(5),
    Order.aggregate(monthlyRevenuePipeline),
    Product.countDocuments({ stock: 0, isActive: true })
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const pendingOrders = ordersByStatus.find((entry) => entry._id === 'pending')?.count || 0;

  return {
    stats: {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      pendingOrders,
      outOfStock,
      lowStockProducts: lowStockProducts.length
    },
    recentOrders,
    lowStockProducts,
    ordersByStatus,
    orderStatusBreakdown: ordersByStatus,
    topProducts,
    monthlyRevenue
  };
};

const sendDashboardPayload = async (req, res) => {
  try {
    res.json(await buildDashboardPayload());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

router.get('/', protect, adminOnly, sendDashboardPayload);
router.get('/stats', protect, adminOnly, sendDashboardPayload);

router.get('/revenue', protect, adminOnly, async (req, res) => {
  try {
    const revenue = await Order.aggregate(monthlyRevenuePipeline);
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
