const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const NotificationService = require("../utils/notificationService");

// Create return request => /api/v1/return/request
exports.createReturnRequest = async (req, res, next) => {
  try {
    const { orderId, returnItems, returnReason, returnAddress } = req.body;

    // Validate required fields
    if (!orderId || !returnItems || !returnReason || !returnAddress) {
      return next(new ErrorHandler("Missing required fields", 400));
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (order.user._id.toString() !== req.user.id) {
      return next(new ErrorHandler("Unauthorized access to order", 403));
    }

    // Check if order is delivered
    if (order.orderStatus !== "Delivered") {
      return next(
        new ErrorHandler("Order must be delivered to request return", 400)
      );
    }

    // Check if return window is still valid
    const returnWindow = 7;
    const daysSinceDelivery = Math.floor(
      (Date.now() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDelivery > returnWindow) {
      return next(
        new ErrorHandler(
          `Return window expired. Returns must be requested within ${returnWindow} days of delivery`,
          400
        )
      );
    }

    // Check if return request already exists for this order
    const existingReturn = await ReturnRequest.findOne({
      order: orderId,
      status: { $nin: ["rejected", "cancelled", "completed"] },
    });

    if (existingReturn) {
      return next(
        new ErrorHandler("Return request already exists for this order", 400)
      );
    }

    // Validate return items
    for (const item of returnItems) {
      const orderItem = order.orderItems.find(
        (oi) => oi.product.toString() === item.product
      );
      if (!orderItem) {
        return next(
          new ErrorHandler(`Product ${item.product} not found in order`, 400)
        );
      }
      if (item.quantity > orderItem.quantity) {
        return next(
          new ErrorHandler(
            `Return quantity for ${item.name} cannot exceed ordered quantity`,
            400
          )
        );
      }
    }

    // Create return request
    const returnRequest = await ReturnRequest.create({
      order: orderId,
      user: req.user.id,
      returnItems,
      returnReason,
      returnAddress,
      returnWindow,
    });

    // Populate the order field for notifications
    returnRequest.order = { _id: orderId };

    // Update order status to "Returned"
    order.orderStatus = "Returned";
    await order.save();

    // Send notification email to customer
    try {
      await sendEmail({
        email: order.user.email,
        subject: "Return Request Submitted - Pure Ghee Store",
        message: `Your return request has been submitted successfully. Return ID: ${returnRequest._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Return Request Submitted</h2>
            <p>Dear ${order.user.name},</p>
            <p>Your return request has been submitted successfully and is under review.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Return Details</h3>
              <p><strong>Return ID:</strong> ${returnRequest._id}</p>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Status:</strong> Pending Review</p>
              <p><strong>Requested At:</strong> ${new Date(
                returnRequest.requestedAt
              ).toLocaleString()}</p>
            </div>
            
            <p>We will review your return request and notify you of the approval status within 1-2 business days.</p>
            <p>Best regards,<br>Pure Ghee Store Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Return request email sending failed:", emailError);
    }

    // Create database notifications
    try {
      console.log(
        "Creating return notification for request:",
        returnRequest._id
      );
      await NotificationService.createReturnNotification(
        returnRequest,
        "requested"
      );
      console.log("Return notification created successfully");
    } catch (error) {
      console.error("Error creating return notifications:", error);
    }

    // Send real-time notification to admins
    if (global.wss) {
      global.wss.sendToAdmins({
        type: "return_requested",
        title: "New Return Request",
        message: `Return request for Order #${order._id} by ${order.user.name}`,
        orderId: order._id,
        returnId: returnRequest._id,
        customerName: order.user.name,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Return request submitted successfully",
      returnRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's return requests => /api/v1/return/my-returns
exports.getMyReturns = async (req, res, next) => {
  try {
    const returns = await ReturnRequest.find({ user: req.user.id })
      .populate("order", "orderStatus totalPrice")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      returns,
    });
  } catch (error) {
    next(error);
  }
};

// Get single return request => /api/v1/return/:id
exports.getReturnRequest = async (req, res, next) => {
  try {
    const returnRequest = await ReturnRequest.findById(req.params.id)
      .populate("order")
      .populate("user", "name email");

    if (!returnRequest) {
      return next(new ErrorHandler("Return request not found", 404));
    }

    // Check if user has access to this return request
    if (
      returnRequest.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorHandler("Unauthorized access to return request", 403)
      );
    }

    res.status(200).json({
      success: true,
      returnRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Update return request status (Admin) => /api/v1/admin/return/:id/status
exports.updateReturnStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const returnRequest = await ReturnRequest.findById(req.params.id)
      .populate("order")
      .populate("user", "name email");

    if (!returnRequest) {
      return next(new ErrorHandler("Return request not found", 404));
    }

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "return_shipped",
      "return_received",
      "refund_processed",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return next(new ErrorHandler("Invalid status", 400));
    }

    const oldStatus = returnRequest.status;
    returnRequest.status = status;
    returnRequest.adminNotes = adminNotes || returnRequest.adminNotes;

    // Set appropriate timestamps
    const now = new Date();
    switch (status) {
      case "approved":
        returnRequest.approvedAt = now;
        break;
      case "rejected":
        returnRequest.rejectedAt = now;
        break;
      case "return_shipped":
        returnRequest.returnShippedAt = now;
        break;
      case "return_received":
        returnRequest.returnReceivedAt = now;
        break;
      case "completed":
        returnRequest.completedAt = now;
        break;
      case "cancelled":
        returnRequest.cancelledAt = now;
        break;
    }

    await returnRequest.save();

    // Send status update email to customer
    try {
      await sendEmail({
        email: returnRequest.user.email,
        subject: `Return Request ${
          status.charAt(0).toUpperCase() + status.slice(1)
        } - Pure Ghee Store`,
        message: `Your return request status has been updated to ${status}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Return Request Status Update</h2>
            <p>Dear ${returnRequest.user.name},</p>
            <p>Your return request status has been updated to <strong>${status
              .replace("_", " ")
              .toUpperCase()}</strong>.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Return Details</h3>
              <p><strong>Return ID:</strong> ${returnRequest._id}</p>
              <p><strong>Order ID:</strong> ${returnRequest.order._id}</p>
              <p><strong>Status:</strong> ${status
                .replace("_", " ")
                .toUpperCase()}</p>
              <p><strong>Updated At:</strong> ${now.toLocaleString()}</p>
              ${
                adminNotes
                  ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>`
                  : ""
              }
            </div>
            
            <p>Thank you for your patience. If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>Pure Ghee Store Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Return status email sending failed:", emailError);
    }

    // Create database notifications
    try {
      console.log(
        "Creating return status notification for:",
        returnRequest._id,
        "Status:",
        status
      );
      await NotificationService.createReturnNotification(returnRequest, status);
      console.log("Return status notification created successfully");
    } catch (error) {
      console.error("Error creating return status notifications:", error);
    }

    res.status(200).json({
      success: true,
      message: "Return status updated successfully",
      returnRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Process return refund (Admin) => /api/v1/admin/return/:id/refund
exports.processReturnRefund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const returnRequest = await ReturnRequest.findById(req.params.id)
      .populate("order")
      .populate("user", "name email");

    if (!returnRequest) {
      return next(new ErrorHandler("Return request not found", 404));
    }

    if (returnRequest.status !== "return_received") {
      return next(
        new ErrorHandler(
          "Return must be received before processing refund",
          400
        )
      );
    }

    if (returnRequest.order.paymentInfo.method === "cod") {
      return next(
        new ErrorHandler("Cannot process refund for COD orders", 400)
      );
    }

    // Check if refund already exists
    if (returnRequest.refundInfo && returnRequest.refundInfo.refundId) {
      return next(
        new ErrorHandler("Refund already processed for this return", 400)
      );
    }

    try {
      const Razorpay = require("razorpay");
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const paymentId =
        returnRequest.order.paymentInfo.razorpay_payment_id ||
        returnRequest.order.paymentInfo.id;

      if (!paymentId) {
        return next(new ErrorHandler("Payment ID not found", 400));
      }

      const refundAmount = amount
        ? Math.round(amount * 100)
        : Math.round(returnRequest.order.totalPrice * 100);

      const refundOptions = {
        payment_id: paymentId,
        amount: refundAmount,
        notes: {
          reason: reason || "Return refund processed",
          return_id: returnRequest._id,
          processed_by: req.user.id,
          processed_at: new Date().toISOString(),
        },
      };

      const refund = await razorpay.payments.refund(paymentId, refundOptions);

      // Update return request with refund information
      returnRequest.refundInfo = {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: reason || "Return refund processed",
        refundedAt: new Date(),
      };

      returnRequest.status = "refund_processed";
      await returnRequest.save();

      // Send refund notification email
      try {
        await sendEmail({
          email: returnRequest.user.email,
          subject: "Return Refund Processed - Pure Ghee Store",
          message: `Your return refund has been processed. Refund ID: ${refund.id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Return Refund Processed</h2>
              <p>Dear ${returnRequest.user.name},</p>
              <p>Your return refund has been successfully processed.</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Refund Details</h3>
                <p><strong>Return ID:</strong> ${returnRequest._id}</p>
                <p><strong>Order ID:</strong> ${returnRequest.order._id}</p>
                <p><strong>Refund Amount:</strong> ₹${refund.amount / 100}</p>
                <p><strong>Refund ID:</strong> ${refund.id}</p>
                <p><strong>Refund Status:</strong> ${refund.status}</p>
                <p><strong>Refund Reason:</strong> ${
                  reason || "Return refund processed"
                }</p>
              </div>
              
              <p>Your refund will be credited to your original payment method within 5-7 business days.</p>
              <p>Best regards,<br>Pure Ghee Store Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Return refund email sending failed:", emailError);
      }

      // Create database notifications
      try {
        await NotificationService.createReturnNotification(
          returnRequest,
          "refund_processed"
        );
      } catch (error) {
        console.error("Error creating return refund notifications:", error);
      }

      res.status(200).json({
        success: true,
        message: "Return refund processed successfully",
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: reason || "Return refund processed",
        },
      });
    } catch (refundError) {
      console.error("Return refund processing failed:", refundError);
      return next(
        new ErrorHandler(
          "Return refund processing failed: " + refundError.message,
          500
        )
      );
    }
  } catch (error) {
    next(error);
  }
};

// Get all return requests (Admin) => /api/v1/admin/returns
exports.getAllReturns = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const returns = await ReturnRequest.find(query)
      .populate("order", "orderStatus totalPrice")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReturnRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      returns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancel return request => /api/v1/return/:id/cancel
exports.cancelReturnRequest = async (req, res, next) => {
  try {
    const returnRequest = await ReturnRequest.findById(req.params.id)
      .populate("order")
      .populate("user", "name email");

    if (!returnRequest) {
      return next(new ErrorHandler("Return request not found", 404));
    }

    if (returnRequest.user._id.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Unauthorized access to return request", 403)
      );
    }

    if (returnRequest.status !== "pending") {
      return next(
        new ErrorHandler("Only pending return requests can be cancelled", 400)
      );
    }

    returnRequest.status = "cancelled";
    returnRequest.cancelledAt = new Date();
    await returnRequest.save();

    // Reset order status if it was changed to "Returned"
    if (returnRequest.order.orderStatus === "Returned") {
      returnRequest.order.orderStatus = "Delivered";
      await returnRequest.order.save();
    }

    res.status(200).json({
      success: true,
      message: "Return request cancelled successfully",
      returnRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get return statistics (Admin) => /api/v1/admin/returns/stats
exports.getReturnStats = async (req, res, next) => {
  try {
    const totalReturns = await ReturnRequest.countDocuments();
    const returnsByStatus = await ReturnRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const recentReturns = await ReturnRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("order", "totalPrice");

    res.status(200).json({
      success: true,
      stats: {
        totalReturns,
        returnsByStatus,
        recentReturns,
      },
    });
  } catch (error) {
    next(error);
  }
};
