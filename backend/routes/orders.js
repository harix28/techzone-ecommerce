const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const calculateOrderTotals = (itemsTotal) => {
  const shippingCost = itemsTotal > 99 ? 0 : 9.99;
  const tax = Number((itemsTotal * 0.08).toFixed(2));
  const totalAmount = Number((itemsTotal + shippingCost + tax).toFixed(2));

  return { shippingCost, tax, totalAmount };
};

const validateShippingAddress = (shippingAddress = {}) => {
  const requiredFields = ['fullName', 'phone', 'street', 'city', 'state', 'zip', 'country'];
  const missingField = requiredFields.find((field) => !shippingAddress[field]);

  if (missingField) {
    throw new Error(`Shipping address is missing ${missingField}`);
  }
};

const buildOrderItems = async (items) => {
  const productIds = [...new Set(items.map((item) => item.product))];
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true
  }).select('name price stock images');

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  if (products.length !== productIds.length) {
    throw new Error('One or more products are unavailable');
  }

  return items.map((item) => {
    const product = productMap.get(String(item.product));
    const quantity = Number(item.quantity);

    if (!product) {
      throw new Error('One or more products are unavailable');
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    if (product.stock < quantity) {
      throw new Error(`${product.name} only has ${product.stock} left in stock`);
    }

    return {
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      quantity
    };
  });
};

const restoreStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity }
    });
  }
};

const reserveStock = async (items) => {
  const updatedItems = [];

  try {
    for (const item of items) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, sold: item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Unable to reserve stock for ${item.name}`);
      }

      updatedItems.push(item);
    }
  } catch (error) {
    await restoreStock(updatedItems);
    throw error;
  }
};

router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    validateShippingAddress(shippingAddress);

    const orderItems = await buildOrderItems(items);
    const itemsTotal = Number(orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2));
    const { shippingCost, tax, totalAmount } = calculateOrderTotals(itemsTotal);

    await reserveStock(orderItems);

    try {
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        itemsTotal,
        shippingCost,
        tax,
        totalAmount
      });

      res.status(201).json(order);
    } catch (error) {
      await restoreStock(orderItems);
      throw error;
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ message: 'Cancelled orders cannot be reopened' });
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      await restoreStock(order.items);
    }

    order.status = status;
    if (typeof trackingNumber !== 'undefined') order.trackingNumber = trackingNumber;
    order.deliveredAt = status === 'delivered' ? new Date() : undefined;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }

    await restoreStock(order.items);
    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
