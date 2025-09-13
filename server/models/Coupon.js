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

couponSchema.methods.canBeUsedByUser = async function (userId, orderAmount) {
  if (!this.isValid()) return false;

  if (typeof orderAmount !== "number" || isNaN(orderAmount)) return false;

  if (orderAmount < this.minimumOrderAmount) return false;

  if (!userId) return true;

  const restrictions = this.userRestrictions || {};

  // Restrict to specific users if defined
  if (
    Array.isArray(restrictions.specificUsers) &&
    restrictions.specificUsers.length > 0
  ) {
    const isAllowed = restrictions.specificUsers
      .map((id) => String(id))
      .includes(String(userId));
    if (!isAllowed) return false;
  }

  if (restrictions.firstTimeOnly) {
    try {
      const Order = require("./Order");
      const existingOrders = await Order.countDocuments({
        user: userId,
        orderStatus: {
          $in: [
            "Processing",
            "Confirmed",
            "Shipped",
            "Out for Delivery",
            "Delivered",
          ],
        },
      });
      if (existingOrders > 0) return false;
    } catch (err) {
      return false;
    }
  }

  if (restrictions.maxUsagePerUser && restrictions.maxUsagePerUser > 0) {
    try {
      const Order = require("./Order");
      const userUsage = await Order.countDocuments({
        user: userId,
        "coupon.code": this.code,
      });
      if (userUsage >= restrictions.maxUsagePerUser) return false;
    } catch (e) {
      return false;
    }
  }

  return true;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;

  if (this.discountType === "percentage") {
    const rawDiscount = (orderAmount * this.discountValue) / 100;
    if (this.maximumDiscount > 0) {
      discount = Math.min(rawDiscount, this.maximumDiscount);
    } else {
      discount = rawDiscount;
    }
  } else {
    discount = this.discountValue;
  }

  const finalDiscount = Math.min(discount, orderAmount);
  return finalDiscount;
};

module.exports = mongoose.model("Coupon", couponSchema);
