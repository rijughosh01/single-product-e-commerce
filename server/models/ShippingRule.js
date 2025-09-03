const mongoose = require("mongoose");

const shippingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter shipping rule name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter shipping rule description"],
  },
  pincodeType: {
    type: String,
    required: [true, "Please specify pincode type"],
    enum: ["single", "range", "state", "zone", "all"],
  },
  pincodes: [
    {
      type: String,
      match: [/^[1-9][0-9]{5}$/, "Please enter a valid pincode"],
    },
  ],
  pincodeRanges: [
    {
      start: {
        type: String,
        required: true,
        match: [/^[1-9][0-9]{5}$/, "Please enter a valid start pincode"],
      },
      end: {
        type: String,
        required: true,
        match: [/^[1-9][0-9]{5}$/, "Please enter a valid end pincode"],
      },
    },
  ],
  states: [
    {
      type: String,
      required: true,
    },
  ],
  zones: [
    {
      type: String,
      enum: ["North", "South", "East", "West", "Central", "North-East"],
    },
  ],
  shippingCharges: {
    type: Number,
    required: [true, "Please enter shipping charges"],
    min: 0,
  },
  freeShippingThreshold: {
    type: Number,
    default: 0,
    min: 0,
  },
  estimatedDeliveryDays: {
    min: {
      type: Number,
      required: true,
      min: 1,
    },
    max: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
shippingRuleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if a pincode matches this rule
shippingRuleSchema.methods.matchesPincode = function (pincode) {
  if (!this.isActive) return false;

  if (this.pincodes.includes(pincode)) {
    return true;
  }

  // Check pincode ranges
  for (const range of this.pincodeRanges) {
    if (pincode >= range.start && pincode <= range.end) {
      return true;
    }
  }

  return false;
};

// Method to get shipping charges for an order
shippingRuleSchema.methods.getShippingCharges = function (orderAmount) {
  if (orderAmount >= this.freeShippingThreshold) {
    return 0;
  }
  return this.shippingCharges;
};

module.exports = mongoose.model("ShippingRule", shippingRuleSchema);
