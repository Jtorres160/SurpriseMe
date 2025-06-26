const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const Content = require('../models/Content');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Platform fee percentage (10%)
const PLATFORM_FEE_PERCENTAGE = 0.10;

// @route   POST /api/payments/create-payment-intent
// @desc    Create a payment intent for purchasing content
// @access  Private
router.post('/create-payment-intent', auth, [
  body('contentId').isMongoId().withMessage('Valid content ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contentId } = req.body;

    // Get content details
    const content = await Content.findById(contentId);
    if (!content || !content.isActive) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check if user is trying to buy their own content
    if (content.creator.toString() === req.user.userId) {
      return res.status(400).json({ error: 'You cannot purchase your own content' });
    }

    // Check if user has already purchased this content
    const existingPurchase = await Purchase.findOne({
      buyer: req.user.userId,
      content: contentId,
      status: 'completed'
    });

    if (existingPurchase) {
      return res.status(400).json({ error: 'You have already purchased this content' });
    }

    // Calculate fees
    const platformFee = content.price * PLATFORM_FEE_PERCENTAGE;
    const creatorEarnings = content.price - platformFee;
    const totalAmount = content.price;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        contentId: contentId,
        buyerId: req.user.userId,
        creatorId: content.creator.toString(),
        platformFee: platformFee.toFixed(2),
        creatorEarnings: creatorEarnings.toFixed(2)
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      platformFee,
      creatorEarnings
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// @route   POST /api/payments/confirm-purchase
// @desc    Confirm a purchase after successful payment
// @access  Private
router.post('/confirm-purchase', auth, [
  body('contentId').isMongoId().withMessage('Valid content ID is required'),
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contentId, paymentIntentId } = req.body;

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Get content details
    const content = await Content.findById(contentId);
    if (!content || !content.isActive) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check if purchase already exists
    const existingPurchase = await Purchase.findOne({
      buyer: req.user.userId,
      content: contentId,
      status: 'completed'
    });

    if (existingPurchase) {
      return res.status(400).json({ error: 'Purchase already completed' });
    }

    // Calculate fees
    const platformFee = content.price * PLATFORM_FEE_PERCENTAGE;
    const creatorEarnings = content.price - platformFee;

    // Create purchase record
    const purchase = new Purchase({
      buyer: req.user.userId,
      content: contentId,
      creator: content.creator,
      amount: content.price,
      platformFee,
      creatorEarnings,
      stripePaymentIntentId: paymentIntentId,
      status: 'completed'
    });

    await purchase.save();

    // Update content stats
    await content.recordPurchase();

    // Update user stats
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { totalSpent: content.price }
    });

    await User.findByIdAndUpdate(content.creator, {
      $inc: { 
        balance: creatorEarnings,
        totalEarnings: creatorEarnings
      }
    });

    res.json({
      message: 'Purchase completed successfully',
      purchase: {
        _id: purchase._id,
        amount: purchase.amount,
        purchasedAt: purchase.purchasedAt
      }
    });
  } catch (error) {
    console.error('Confirm purchase error:', error);
    res.status(500).json({ error: 'Failed to confirm purchase' });
  }
});

// @route   GET /api/payments/purchases
// @desc    Get user's purchase history
// @access  Private
router.get('/purchases', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const purchases = await Purchase.getUserPurchases(req.user.userId, parseInt(page), parseInt(limit));
    
    res.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/payments/sales
// @desc    Get creator's sales history
// @access  Private
router.get('/sales', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const sales = await Purchase.getCreatorSales(req.user.userId, parseInt(page), parseInt(limit));
    
    res.json({ sales });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/payments/earnings
// @desc    Get creator's earnings statistics
// @access  Private
router.get('/earnings', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const earnings = await Purchase.getCreatorEarnings(req.user.userId, startDate, endDate);
    
    res.json({ earnings: earnings[0] || { totalEarnings: 0, totalSales: 0, averagePrice: 0 } });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/payments/withdraw
// @desc    Withdraw earnings to bank account
// @access  Private
router.post('/withdraw', auth, [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Withdrawal amount must be at least $1'),
  body('bankAccountId').notEmpty().withMessage('Bank account ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, bankAccountId } = req.body;

    // Get user with current balance
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create transfer to bank account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: bankAccountId,
      description: `Withdrawal from SurpriseMe - ${user.username}`
    });

    // Update user balance
    user.balance -= amount;
    await user.save();

    res.json({
      message: 'Withdrawal initiated successfully',
      transfer: {
        id: transfer.id,
        amount: amount,
        status: transfer.status
      }
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router; 