const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const NotificationService = require("../utils/notificationService");

// Create new order => /api/v1/order/new
exports.newOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
      coupon: appliedCoupon,
      discount: discountFromSummary,
    } = req.body;

    // Normalize coupon object to persist calculated discount
    const normalizedCoupon = (() => {
      if (!appliedCoupon) return undefined;
      const discountApplied = Number(
        discountFromSummary ??
          appliedCoupon.discountApplied ??
          appliedCoupon.discount ??
          0
      );
      return {
        code: appliedCoupon.code || null,
        discountType: appliedCoupon.discountType || null,
        discountValue: Number(appliedCoupon.discountValue || 0),
        discountApplied: isNaN(discountApplied) ? 0 : discountApplied,
      };
    })();

    const order = await Order.create({
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
      paidAt: Date.now(),
      user: req.user.id,
      coupon: normalizedCoupon,
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    // If coupon used, increment coupon counters
    try {
      if (appliedCoupon && appliedCoupon.code) {
        const Coupon = require("../models/Coupon");
        const couponDoc = await Coupon.findOne({
          code: appliedCoupon.code.toUpperCase(),
        });
        if (couponDoc) {
          couponDoc.usedCount = (couponDoc.usedCount || 0) + 1;
          await couponDoc.save();
        }
      }
    } catch (err) {
      console.error("Error incrementing coupon usage:", err);
    }

    try {
      await sendEmail({
        email: req.user.email,
        subject: "Order Confirmation - Ghee E-commerce",
        message: `Thank you for your order! Your order ID is ${order._id}. We will process your order soon.`,
        html: `
          <h2>Order Confirmation</h2>
          <p>Dear ${req.user.name},</p>
          <p>Thank you for your order! Your order has been successfully placed.</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
          <p>We will process your order and ship it to you soon.</p>
          <p>Best regards,<br>Ghee E-commerce Team</p>
        `,
      });
    } catch (error) {
      console.log("Email sending failed:", error);
    }

    // Create database notifications
    try {
      await NotificationService.createOrderNotification(order, "created");
    } catch (error) {
      console.error("Error creating order notifications:", error);
    }

    // Send real-time notification to admins
    if (global.wss) {
      global.wss.sendToAdmins({
        type: "new_order",
        title: "New Order Received",
        message: `Order #${order._id} placed by ${req.user.name} for ₹${totalPrice}`,
        orderId: order._id,
        customerName: req.user.name,
        amount: totalPrice,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get single order => /api/v1/order/:id
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get logged in user orders => /api/v1/orders/me
exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders - Admin => /api/v1/admin/orders
exports.allOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email");

    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Update / Process order - Admin => /api/v1/admin/order/:id
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(
        new ErrorHandler("You have already delivered this order", 400)
      );
    }

    const newStatus = req.body.orderStatus || req.body.status;
    order.orderStatus = newStatus;

    // If admin marks Delivered, auto-complete COD payment and set paidAt
    if (newStatus === "Delivered") {
      order.deliveredAt = Date.now();

      if (order.paymentInfo && order.paymentInfo.method === "cod") {
        order.paymentInfo.status = "completed";
        order.paidAt = Date.now();

        // Update linked invoice payment status/date if present
        try {
          if (order.invoice) {
            await Invoice.findByIdAndUpdate(order.invoice, {
              paymentStatus: "Paid",
              paymentMethod: "cod",
              paymentDate: new Date(),
            });
          }
        } catch (err) {
          console.error("Failed to update invoice for COD delivery:", err);
        }
      }
    }

    await order.save();

    // Create database notifications for order status update
    try {
      const eventType = newStatus.toLowerCase().replace(/\s+/g, "_");
      await NotificationService.createOrderNotification(order, eventType);

      if (newStatus === "Shipped") {
        await NotificationService.createShippingNotification(order, "shipped");
      }

      if (newStatus === "Delivered") {
        await NotificationService.createShippingNotification(
          order,
          "delivered"
        );
      }
    } catch (error) {
      console.error("Error creating order status notifications:", error);
    }

    // Send status update email
    try {
      await sendEmail({
        email: order.user.email,
        subject: `Order Status Update - ${
          req.body.orderStatus || req.body.status
        }`,
        message: `Your order status has been updated to ${
          req.body.orderStatus || req.body.status
        }.`,
        html: `
          <h2>Order Status Update</h2>
          <p>Dear Customer,</p>
          <p>Your order status has been updated to <strong>${
            req.body.orderStatus || req.body.status
          }</strong>.</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p>Thank you for choosing us!</p>
          <p>Best regards,<br>Ghee E-commerce Team</p>
        `,
      });
    } catch (error) {
      console.log("Email sending failed:", error);
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Delete order => /api/v1/admin/order/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Get order statistics - Admin => /api/v1/admin/orders/stats
exports.getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Process refund - Admin => /api/v1/admin/order/:id/refund
exports.processRefund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (order.paymentInfo.method === "cod") {
      return next(
        new ErrorHandler("Cannot process refund for COD orders", 400)
      );
    }

    // Check for payment ID in different possible locations
    const paymentId =
      order.paymentInfo.razorpay_payment_id || order.paymentInfo.id;

    if (!paymentId) {
      return next(new ErrorHandler("Payment ID not found", 400));
    }

    // Check if refund already exists
    if (order.refundInfo && order.refundInfo.refundId) {
      return next(
        new ErrorHandler(
          "Refund already exists for this order. Refund ID: " +
            order.refundInfo.refundId,
          400
        )
      );
    }

    try {
      const Razorpay = require("razorpay");
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const refundAmount = amount
        ? Math.round(amount * 100)
        : Math.round(order.totalPrice * 100);

      const refundOptions = {
        payment_id: paymentId,
        amount: refundAmount,
        notes: {
          reason: reason || "Refund processed by admin",
          processed_by: req.user.id,
          processed_at: new Date().toISOString(),
        },
      };

      const refund = await razorpay.payments.refund(paymentId, refundOptions);

      // Update order with refund information
      order.refundInfo = {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: reason || "Refund processed by admin",
        refundedAt: new Date(),
      };

      // Update order status to cancelled if not already
      if (order.orderStatus !== "Cancelled") {
        order.orderStatus = "Cancelled";
        order.cancelledAt = new Date();
      }

      await order.save();

      try {
        await sendEmail({
          email: order.user.email,
          subject: "Refund Processed - Pure Ghee Store",
          message: `Your refund has been processed. Refund ID: ${refund.id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Refund Processed</h2>
              <p>Dear ${order.user.name},</p>
              <p>Your refund has been successfully processed.</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Refund Details</h3>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Refund Amount:</strong> ₹${refund.amount / 100}</p>
                <p><strong>Refund ID:</strong> ${refund.id}</p>
                <p><strong>Refund Status:</strong> ${refund.status}</p>
                <p><strong>Refund Reason:</strong> ${
                  reason || "Refund processed by admin"
                }</p>
              </div>
              
              <p>Your refund will be credited to your original payment method within 5-7 business days.</p>
              <p>Best regards,<br>Pure Ghee Store Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Refund email sending failed:", emailError);
      }

      // Create database notifications
      try {
        await NotificationService.createOrderNotification(
          order,
          "refund_processed"
        );
      } catch (error) {
        console.error("Error creating refund notifications:", error);
      }

      res.status(200).json({
        success: true,
        message: "Refund processed successfully",
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: reason || "Refund processed by admin",
        },
      });
    } catch (refundError) {
      console.error("Refund processing failed:", refundError);
      return next(
        new ErrorHandler(
          "Refund processing failed: " + refundError.message,
          500
        )
      );
    }
  } catch (error) {
    next(error);
  }
};

// Get refund details - Admin => /api/v1/admin/order/:id/refund
exports.getRefundDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (!order.refundInfo || !order.refundInfo.refundId) {
      return next(new ErrorHandler("No refund found for this order", 404));
    }

    // Get payment ID for refund lookup
    const paymentId =
      order.paymentInfo.razorpay_payment_id || order.paymentInfo.id;

    if (!paymentId) {
      return next(new ErrorHandler("Payment ID not found", 400));
    }

    try {
      const Razorpay = require("razorpay");
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const refund = await razorpay.refunds.fetch(order.refundInfo.refundId);

      res.status(200).json({
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          notes: refund.notes,
          created_at: refund.created_at,
          receipt: refund.receipt,
        },
      });
    } catch (refundError) {
      console.error("Fetch refund details failed:", refundError);

      // Check if it's a Razorpay API error
      if (refundError.response) {
        const errorMessage =
          refundError.response.data?.error?.description ||
          refundError.response.data?.error?.message ||
          "Razorpay API error";
        return next(
          new ErrorHandler(
            `Failed to fetch refund details: ${errorMessage}`,
            500
          )
        );
      }

      return next(
        new ErrorHandler("Failed to fetch refund details from Razorpay", 500)
      );
    }
  } catch (error) {
    next(error);
  }
};

// Cancel order => /api/v1/order/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (order.user._id.toString() !== req.user.id) {
      return next(
        new ErrorHandler("You are not authorized to cancel this order", 403)
      );
    }

    if (order.orderStatus === "Delivered" || order.orderStatus === "Shipped") {
      return next(
        new ErrorHandler("Order cannot be cancelled at this stage", 400)
      );
    }

    if (order.orderStatus === "Cancelled") {
      return next(new ErrorHandler("Order is already cancelled", 400));
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    // If payment was made and not COD, initiate refund
    if (
      order.paymentInfo.method !== "cod" &&
      order.paymentInfo.status === "completed"
    ) {
      try {
        const Razorpay = require("razorpay");
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Get payment ID from different possible locations
        const paymentId =
          order.paymentInfo.razorpay_payment_id || order.paymentInfo.id;

        if (!paymentId) {
          throw new Error("Payment ID not found for refund");
        }

        const refundOptions = {
          payment_id: paymentId,
          amount: Math.round(order.totalPrice * 100),
          notes: {
            reason: reason || "Order cancelled by customer",
            cancelled_by: req.user.id,
            cancelled_at: new Date().toISOString(),
          },
        };

        const refund = await razorpay.payments.refund(paymentId, refundOptions);

        // Update order with refund information
        order.refundInfo = {
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: reason || "Order cancelled by customer",
          refundedAt: new Date(),
        };

        // Send refund notification email
        try {
          await sendEmail({
            email: order.user.email,
            subject: "Order Cancelled & Refund Initiated - Pure Ghee Store",
            message: `Your order has been cancelled and refund has been initiated. Refund ID: ${refund.id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f97316;">Order Cancelled & Refund Initiated</h2>
                <p>Dear ${order.user.name},</p>
                <p>Your order has been successfully cancelled and refund has been initiated.</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Order Details</h3>
                  <p><strong>Order ID:</strong> ${order._id}</p>
                  <p><strong>Refund Amount:</strong> ₹${order.totalPrice}</p>
                  <p><strong>Refund ID:</strong> ${refund.id}</p>
                  <p><strong>Refund Status:</strong> ${refund.status}</p>
                  <p><strong>Cancellation Reason:</strong> ${
                    reason || "Order cancelled by customer"
                  }</p>
                </div>
                
                <p>Your refund will be processed within 5-7 business days and will be credited to your original payment method.</p>
                <p>Best regards,<br>Pure Ghee Store Team</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Refund email sending failed:", emailError);
        }
      } catch (refundError) {
        console.error("Refund processing failed:", refundError);
        // Still cancel the order even if refund fails
        order.refundInfo = {
          refundId: null,
          amount: order.totalPrice,
          status: "failed",
          reason: reason || "Order cancelled by customer",
          refundedAt: null,
        };
      }
    }

    await order.save();

    // Create database notifications for order cancellation
    try {
      await NotificationService.createOrderNotification(order, "cancelled");
    } catch (error) {
      console.error("Error creating order cancellation notifications:", error);
    }

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Send real-time notification to admins
    if (global.wss) {
      global.wss.sendToAdmins({
        type: "order_cancelled",
        title: "Order Cancelled",
        message: `Order #${order._id} cancelled by ${req.user.name}`,
        orderId: order._id,
        customerName: req.user.name,
        amount: order.totalPrice,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      refundInfo: order.refundInfo,
    });
  } catch (error) {
    next(error);
  }
};
