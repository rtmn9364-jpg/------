/**
 * Cart Routes
 * GET    /api/cart         - Get user's cart
 * POST   /api/cart/add     - Add item to cart
 * PUT    /api/cart/update  - Update item quantity
 * DELETE /api/cart/:productId - Remove item
 * DELETE /api/cart         - Clear entire cart
 */

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);

// ─── Get cart ─────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price stock isActive');

    if (!cart) {
      return res.json({ success: true, cart: { items: [], subtotal: 0, itemCount: 0 } });
    }

    // Filter out inactive/deleted products
    cart.items = cart.items.filter(item => item.product && item.product.isActive);

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Add item to cart ─────────────────────────────────────────────────────────
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and has stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user._id,
        items: [{ product: productId, quantity, price: product.price }]
      });
    } else {
      // Check if item already in cart
      const existingItem = cart.items.find(i => i.product.toString() === productId);
      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock) {
          return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
        }
        existingItem.quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity, price: product.price });
      }
    }

    await cart.save();
    await cart.populate('items.product', 'name images price stock');

    res.json({ success: true, cart, message: 'Item added to cart.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Update item quantity ─────────────────────────────────────────────────────
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart.' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name images price stock');

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Remove item from cart ────────────────────────────────────────────────────
router.delete('/item/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.product', 'name images price stock');

    res.json({ success: true, cart, message: 'Item removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Clear entire cart ────────────────────────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
