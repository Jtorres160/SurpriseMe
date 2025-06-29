const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  platformFee: {
    type: Number,
    default: 0
  },
  creatorEarnings: {
    type: Number,
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  refundReason: {
    type: String,
    default: ''
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
purchaseSchema.index({ buyer: 1, purchasedAt: -1 });
purchaseSchema.index({ creator: 1, purchasedAt: -1 });
purchaseSchema.index({ content: 1 });
purchaseSchema.index({ stripePaymentIntentId: 1 });

// Virtual for total amount including fees
purchaseSchema.virtual('totalAmount').get(function() {
  return this.amount + this.platformFee;
});

// Static method to get user's purchase history
purchaseSchema.statics.getUserPurchases = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ buyer: userId })
    .sort({ purchasedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('content', 'title thumbnailUrl type price')
    .populate('creator', 'username profilePicture');
};

// Static method to get creator's sales history
purchaseSchema.statics.getCreatorSales = function(creatorId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ creator: creatorId })
    .sort({ purchasedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('content', 'title thumbnailUrl type price')
    .populate('buyer', 'username profilePicture');
};

// Static method to calculate creator earnings
purchaseSchema.statics.getCreatorEarnings = function(creatorId, startDate, endDate) {
  const query = { creator: creatorId, status: 'completed' };
  
  if (startDate && endDate) {
    query.purchasedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalEarnings: { $sum: '$creatorEarnings' },
      totalSales: { $sum: 1 },
      averagePrice: { $avg: '$amount' }
    }}
  ]);
};

module.exports = mongoose.model('Purchase', purchaseSchema); 