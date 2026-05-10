/**
 * Orders Routes
 * POST /api/orders           - Create new order
 * GET  /api/orders           - Get user's orders
 * GET  /api/orders/:id       - Get single order
 * PUT  /api/orders/:id/pay   - Mark order as paid
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.use(protect);

// ─── Create order ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price stock');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Validate stock for each item
    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product?.name || 'a product'}.`
        });
      }
    }

    // Build order items
    const orderItems = cart.items.map(item => ({
      product:  item.product._id,
      name:     item.product.name,
      image:    item.product.images[0],
      price:    item.price,
      quantity: item.quantity
    }));

    // Calculate prices
    const itemsPrice    = cart.subtotal;
    const shippingPrice = itemsPrice > 100 ? 0 : 9.99;        // Free shipping over $100
    const taxPrice      = Math.round(itemsPrice * 0.08 * 100) / 100; // 8% tax
    const totalPrice    = itemsPrice + shippingPrice + taxPrice;

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    // Decrease stock for each product
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear the cart
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get user's orders ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .select('-orderItems.product'); // Lighter response

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get single order ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Ensure user can only see their own orders (unless admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Mark order as paid (called after payment confirmation) ───────────────────
router.put('/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentResult = {
      id:           req.body.id,
      status:       req.body.status,
      updateTime:   req.body.update_time,
      emailAddress: req.body.payer?.email_address
    };

    const updated = await order.save();
    res.json({ success: true, order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
