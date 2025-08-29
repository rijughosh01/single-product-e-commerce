const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  frequency: {
    type: String,
    required: true,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly']
  },
  nextDeliveryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'completed'],
    default: 'active'
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  maxDeliveries: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  pauseReason: {
    type: String
  },
  cancelReason: {
    type: String
  },
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate next delivery date
subscriptionSchema.methods.calculateNextDelivery = function() {
  const currentDate = new Date();
  let nextDate = new Date(currentDate);
  
  switch (this.frequency) {
    case 'weekly':
      nextDate.setDate(currentDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(currentDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(currentDate.getMonth() + 3);
      break;
  }
  
  return nextDate;
};

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && 
         (this.maxDeliveries === 0 || this.completedDeliveries < this.maxDeliveries) &&
         (!this.endDate || new Date() <= this.endDate);
};

// Method to pause subscription
subscriptionSchema.methods.pause = function(reason) {
  this.status = 'paused';
  this.pauseReason = reason;
  return this;
};

// Method to resume subscription
subscriptionSchema.methods.resume = function() {
  this.status = 'active';
  this.pauseReason = undefined;
  return this;
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancelReason = reason;
  this.endDate = new Date();
  return this;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
