const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
    max: 1000
  },
  isLocked: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  category: {
    type: String,
    enum: ['art', 'photography', 'music', 'videos', 'other'],
    default: 'other'
  },
  views: {
    type: Number,
    default: 0
  },
  purchases: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // for videos in seconds
    default: 0
  },
  dimensions: {
    width: Number,
    height: Number
  }
}, {
  timestamps: true
});

// Index for better query performance
contentSchema.index({ creator: 1, createdAt: -1 });
contentSchema.index({ category: 1, isActive: 1 });
contentSchema.index({ tags: 1 });

// Virtual for total earnings
contentSchema.virtual('totalEarnings').get(function() {
  return this.purchases * this.price;
});

// Method to increment views
contentSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to record purchase
contentSchema.methods.recordPurchase = function() {
  this.purchases += 1;
  this.totalRevenue += this.price;
  return this.save();
};

// Static method to get trending content
contentSchema.statics.getTrending = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ views: -1, purchases: -1 })
    .limit(limit)
    .populate('creator', 'username profilePicture isVerified');
};

// Static method to get content by category
contentSchema.statics.getByCategory = function(category, page = 1, limit = 12) {
  const skip = (page - 1) * limit;
  return this.find({ category, isActive: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('creator', 'username profilePicture isVerified');
};

module.exports = mongoose.model('Content', contentSchema); 