const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please enter notification title"],
  },
  message: {
    type: String,
    required: [true, "Please enter notification message"],
  },
  type: {
    type: String,
    required: [true, "Please specify notification type"],
    enum: [
      "order",
      "payment",
      "shipping",
      "promotion",
      "system",
      "stock",
      "return",
    ],
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  actionUrl: {
    type: String,
  },
  actionText: {
    type: String,
  },
  metadata: {
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    paymentId: String,
    trackingNumber: String,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this;
};

// Method to check if notification is expired
notificationSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model("Notification", notificationSchema);
