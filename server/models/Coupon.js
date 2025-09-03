const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please enter coupon code"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter coupon description"],
  },
  discountType: {
    type: String,
    required: [true, "Please specify discount type"],
    enum: ["percentage", "fixed"],
  },
  discountValue: {
    type: Number,
    required: [true, "Please enter discount value"],
    min: 0,
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  maximumDiscount: {
    type: Number,
    default: 0,
    min: 0,
  },
  usageLimit: {
    type: Number,
    default: 0,
    min: 0,
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  validFrom: {
    type: Date,
    required: [true, "Please enter valid from date"],
  },
  validUntil: {
    type: Date,
    required: [true, "Please enter valid until date"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  applicableProducts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  applicableCategories: [
    {
      type: String,
      enum: ["Ghee"],
    },
  ],
  userRestrictions: {
    firstTimeOnly: {
      type: Boolean,
      default: false,
    },
    specificUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    maxUsagePerUser: {
      type: Number,
      default: 1,
      min: 1,
    },
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
couponSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === 0 || this.usedCount < this.usageLimit)
  );
};

// Method to check if coupon can be used by user
couponSchema.methods.canBeUsedByUser = function (userId, orderAmount) {
  if (!this.isValid()) return false;

  if (orderAmount < this.minimumOrderAmount) return false;

  return true;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;

  if (this.discountType === "percentage") {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maximumDiscount > 0) {
      discount = Math.min(discount, this.maximumDiscount);
    }
  } else {
    discount = this.discountValue;
  }

  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model("Coupon", couponSchema);
