const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  returnItems: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      reason: {
        type: String,
        required: true,
        enum: [
          "defective_product",
          "wrong_item",
          "not_as_described",
          "damaged_during_shipping",
          "changed_mind",
          "other",
        ],
      },
      description: {
        type: String,
        maxlength: 500,
      },
    },
  ],
  status: {
    type: String,
    required: true,
    default: "pending",
    enum: [
      "pending",
      "approved",
      "rejected",
      "return_shipped",
      "return_received",
      "refund_processed",
      "completed",
      "cancelled",
    ],
  },
  returnReason: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  adminNotes: {
    type: String,
    maxlength: 1000,
    default: "",
  },
  returnAddress: {
    name: {
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
    phone: {
      type: String,
      required: true,
    },
  },
  trackingNumber: {
    type: String,
    default: null,
  },
  returnTrackingNumber: {
    type: String,
    default: null,
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
    // COD refund specific fields
    refundMethod: {
      type: String,
      enum: ["razorpay", "bank_transfer", "upi", "cash"],
      default: null,
    },
    bankTransferDetails: {
      transactionId: {
        type: String,
        default: "",
      },
      bankName: {
        type: String,
        default: "",
      },
      accountNumber: {
        type: String,
        default: "",
      },
      ifscCode: {
        type: String,
        default: "",
      },
      transferDate: {
        type: Date,
        default: null,
      },
      referenceNumber: {
        type: String,
        default: "",
      },
    },
    upiDetails: {
      upiId: {
        type: String,
        default: "",
      },
      transactionId: {
        type: String,
        default: "",
      },
      transferDate: {
        type: Date,
        default: null,
      },
    },
  },
  returnWindow: {
    type: Number,
    default: 7,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
  returnShippedAt: {
    type: Date,
    default: null,
  },
  returnReceivedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
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

// Update the updatedAt field before saving
returnRequestSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
returnRequestSchema.index({ order: 1 });
returnRequestSchema.index({ user: 1 });
returnRequestSchema.index({ status: 1 });
returnRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
