/**
 * Payment Routes
 * POST /api/payment/stripe/create-intent  - Create Stripe payment intent
 * POST /api/payment/stripe/confirm        - Confirm Stripe payment
 * GET  /api/payment/paypal/client-id      - Get PayPal client ID for frontend
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

// Initialize Stripe with secret key
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (e) {
  console.warn('Stripe not configured. Set STRIPE_SECRET_KEY in .env');
}

// ─── Stripe: Create Payment Intent ───────────────────────────────────────────
router.post('/stripe/create-intent', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Stripe not configured.' });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Create a PaymentIntent with the order total
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),  // Stripe uses cents
      currency: 'usd',
      metadata: {
        orderId: orderId,
        userId:  req.user._id.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Stripe: Webhook (for server-side payment confirmation) ──────────────────
// Note: Use raw body for webhook signature verification
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) return res.sendStatus(200);

    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paidAt: Date.now(),
        status: 'processing',
        paymentResult: {
          id:     paymentIntent.id,
          status: paymentIntent.status
        }
      });
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ message: `Webhook error: ${error.message}` });
  }
});

// ─── PayPal: Provide client ID to frontend ────────────────────────────────────
router.get('/paypal/client-id', (req, res) => {
  if (!process.env.PAYPAL_CLIENT_ID) {
    return res.status(503).json({ success: false, message: 'PayPal not configured.' });
  }
  res.json({ success: true, clientId: process.env.PAYPAL_CLIENT_ID });
});

// ─── PayPal: Verify and capture payment ──────────────────────────────────────
router.post('/paypal/capture', protect, async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;

    // In production: verify with PayPal API using paypalOrderId
    // For sandbox/demo: trust the frontend confirmation
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentResult = {
      id:     paypalOrderId,
      status: 'COMPLETED'
    };

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
