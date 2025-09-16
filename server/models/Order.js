const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  shippingInfo: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
  },
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
  },
  paidAt: {
    type: Date,
    required: true,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  coupon: {
    code: { type: String, default: null },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: null,
    },
    discountValue: { type: Number, default: 0 },
    discountApplied: { type: Number, default: 0 },
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
    enum: [
      "Processing",
      "Confirmed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
  },
  deliveredAt: Date,
  trackingNumber: {
    type: String,
    default: null,
  },
  estimatedDelivery: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: "",
  },
  refundInfo: {
    refundId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: null,
    },
    reason: {
      type: String,
      default: "",
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  invoice: {
    type: mongoose.Schema.ObjectId,
    ref: "Invoice",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate delivery date (3-5 days from order)
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.estimatedDelivery) {
    const deliveryDays = Math.floor(Math.random() * 3) + 3;
    this.estimatedDelivery = new Date(
      Date.now() + deliveryDays * 24 * 60 * 60 * 1000
    );
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
