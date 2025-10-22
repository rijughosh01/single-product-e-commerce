const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const NotificationService = require("../utils/notificationService");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("Razorpay initialized:", {
  keyId: process.env.RAZORPAY_KEY_ID ? "present" : "missing",
  keySecret: process.env.RAZORPAY_KEY_SECRET ? "present" : "missing",
  keyIdValue: process.env.RAZORPAY_KEY_ID
    ? process.env.RAZORPAY_KEY_ID.substring(0, 10) + "..."
    : "missing",
});

// Test Razorpay connection
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  console.log("Razorpay credentials are configured");
} else {
  console.error("Razorpay credentials are missing!");
  console.error(
    "RAZORPAY_KEY_ID:",
    process.env.RAZORPAY_KEY_ID ? "present" : "missing"
  );
  console.error(
    "RAZORPAY_KEY_SECRET:",
    process.env.RAZORPAY_KEY_SECRET ? "present" : "missing"
  );
}

// Create Razorpay order => /api/v1/payment/create-order
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = "INR", orderData } = req.body;

    console.log("Create payment order request:", {
      amount,
      currency,
      orderData: orderData
        ? {
            userId: orderData.userId,
            orderItems: orderData.orderItems?.length,
            totalPrice: orderData.totalPrice,
            shippingInfo: orderData.shippingInfo ? "present" : "missing",
          }
        : "missing",
      user: req.user?.id,
    });

    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      return next(new ErrorHandler("Invalid amount", 400));
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: `receipt_${Date.now()}`.substring(0, 40),
      payment_capture: 1,
      notes: {
        user_id: req.user.id,
        order_type: "ecommerce",
        ...orderData,
      },
    };

    console.log("Creating Razorpay order with options:", {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      payment_capture: options.payment_capture,
      notes: options.notes,
    });

    const razorpayOrder = await razorpay.orders.create(options);

    console.log("Razorpay order created successfully:", {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status,
    });

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      orderId: razorpayOrder.id,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response?.data,
    });
    next(new ErrorHandler("Failed to create payment order", 500));
  }
};

// Verify payment and create order => /api/v1/payment/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    console.log("Payment verification request:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? "present" : "missing",
      orderData: orderData
        ? {
            userId: orderData.userId,
            orderItems: orderData.orderItems?.length,
            totalPrice: orderData.totalPrice,
            shippingInfo: orderData.shippingInfo ? "present" : "missing",
          }
        : "missing",
      user: req.user?.id,
      userType: typeof req.user?.id,
      isAuthenticated: !!req.user,
      userObject: req.user
        ? {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
          }
        : null,
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing required payment verification fields");
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
    }

    if (!orderData || !orderData.orderItems || !orderData.shippingInfo) {
      console.error("Missing required order data");
      return res.status(400).json({
        success: false,
        message: "Missing required order data",
      });
    }

    if (!req.user || !req.user.id) {
      console.error("User not authenticated");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log("Signature verification:", {
      provided: razorpay_signature,
      expected: expectedSign,
      match: razorpay_signature === expectedSign,
    });

    if (razorpay_signature !== expectedSign) {
      console.error("Payment signature verification failed");
      return next(new ErrorHandler("Payment verification failed", 400));
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      return next(new ErrorHandler("Payment not captured", 400));
    }

    // Create order in database
    console.log("Creating order with data:", {
      orderItems: orderData.orderItems?.length,
      shippingInfo: orderData.shippingInfo ? "present" : "missing",
      itemsPrice: orderData.itemsPrice,
      taxPrice: orderData.taxPrice,
      shippingPrice: orderData.shippingPrice,
      totalPrice: orderData.totalPrice,
      user: req.user.id,
    });

    let order;
    try {
      // Normalize coupon and persist applied discount amount
      const normalizedCoupon = (() => {
        const c = orderData.coupon;
        if (!c) return undefined;
        const discountApplied = Number(
          orderData.discount ?? c.discountApplied ?? c.discount ?? 0
        );
        return {
          code: c.code || null,
          discountType: c.discountType || null,
          discountValue: Number(c.discountValue || 0),
          discountApplied: isNaN(discountApplied) ? 0 : discountApplied,
        };
      })();

      const orderDataToCreate = {
        orderItems: orderData.orderItems,
        shippingInfo: orderData.shippingInfo,
        itemsPrice: orderData.itemsPrice,
        taxPrice: orderData.taxPrice,
        shippingPrice: orderData.shippingPrice,
        totalPrice: orderData.totalPrice,
        paymentInfo: {
          id: razorpay_payment_id,
          status: "completed",
          method: "razorpay",
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
        },
        paidAt: new Date(),
        user: req.user.id,
        coupon: normalizedCoupon,
      };

      console.log(
        "Order data to create:",
        JSON.stringify(orderDataToCreate, null, 2)
      );
      console.log("User ID type:", typeof req.user.id);
      console.log("User ID value:", req.user.id);
      console.log("Order items structure:", orderData.orderItems);

      // Validate orderItems structure
      if (
        !orderData.orderItems ||
        !Array.isArray(orderData.orderItems) ||
        orderData.orderItems.length === 0
      ) {
        console.error("Invalid orderItems:", orderData.orderItems);
        return res.status(400).json({
          success: false,
          message: "Invalid order items",
        });
      }

      // Validate each order item
      for (let i = 0; i < orderData.orderItems.length; i++) {
        const item = orderData.orderItems[i];
        if (!item.name || !item.quantity || !item.price || !item.product) {
          console.error(`Invalid order item at index ${i}:`, item);
          return res.status(400).json({
            success: false,
            message: `Invalid order item at index ${i}`,
          });
        }

        if (typeof item.product === "string") {
          orderDataToCreate.orderItems[i].product = new mongoose.Types.ObjectId(
            item.product
          );
        }
      }

      // Validate user ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        console.error("Invalid user ID:", req.user.id);
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (typeof req.user.id === "string") {
        orderDataToCreate.user = new mongoose.Types.ObjectId(req.user.id);
        console.log("Converted user ID to ObjectId:", orderDataToCreate.user);
      }

      // Validate shippingInfo structure
      if (
        !orderData.shippingInfo ||
        !orderData.shippingInfo.name ||
        !orderData.shippingInfo.phone ||
        !orderData.shippingInfo.address ||
        !orderData.shippingInfo.city ||
        !orderData.shippingInfo.state ||
        !orderData.shippingInfo.pincode
      ) {
        console.error("Invalid shippingInfo:", orderData.shippingInfo);
        return res.status(400).json({
          success: false,
          message: "Invalid shipping information",
        });
      }

      // Initialize status timeline
      orderDataToCreate.statusTimeline = [
        {
          status: "Processing",
          timestamp: new Date(),
          changedBy: req.user.id,
        },
      ];

      order = await Order.create(orderDataToCreate);

      console.log("Order created successfully:", {
        orderId: order._id,
        totalPrice: order.totalPrice,
        user: order.user,
        orderStatus: order.orderStatus,
      });
    } catch (orderError) {
      console.error("Order creation failed:", orderError);
      console.error("Order creation error details:", {
        message: orderError.message,
        name: orderError.name,
        code: orderError.code,
        errors: orderError.errors,
      });

      return res.status(500).json({
        success: false,
        message: "Order creation failed",
        error: orderError.message,
      });
    }

    // Update product stock
    for (const item of orderData.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    // Update coupon usage if applied
    if (orderData.coupon && orderData.coupon.code) {
      try {
        const Coupon = require("../models/Coupon");
        const couponDoc = await Coupon.findOne({
          code: orderData.coupon.code.toUpperCase(),
        });
        if (couponDoc) {
          couponDoc.usedCount = (couponDoc.usedCount || 0) + 1;
          await couponDoc.save();
        }
      } catch (err) {
        console.error("Coupon update error:", err);
      }
    }

    // Generate invoice
    try {
      const invoice = await generateInvoiceForOrder(order);
      order.invoice = invoice._id;
      await order.save();
    } catch (err) {
      console.error("Invoice generation error:", err);
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user, order);
    } catch (err) {
      console.error("Email sending error:", err);
    }

    // Create database notifications
    try {
      await NotificationService.createOrderNotification(order, "created");
      await NotificationService.createPaymentNotification(
        payment,
        order,
        "success"
      );
    } catch (error) {
      console.error("Error creating payment notifications:", error);
    }

    // Send real-time notification to admins
    if (global.wss) {
      global.wss.sendToAdmins({
        type: "new_order",
        title: "New Order Received",
        message: `Order #${order._id} placed by ${req.user.name} for ₹${order.totalPrice}`,
        orderId: order._id,
        customerName: req.user.name,
        amount: order.totalPrice,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("Order created successfully:", {
      orderId: order._id,
      totalPrice: order.totalPrice,
      user: order.user,
      orderStatus: order.orderStatus,
    });

    // Check if order was created successfully
    if (!order || !order._id) {
      console.error("Order creation failed - order object is invalid:", order);
      return res.status(500).json({
        success: false,
        message: "Order creation failed",
        error: "Order object is invalid",
      });
    }

    const responseData = {
      success: true,
      message: "Payment verified successfully",
      order: order,
      payment: {
        id: razorpay_payment_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
      },
    };

    console.log("Sending verification response:", {
      success: responseData.success,
      orderId: responseData.order?._id,
      orderExists: !!responseData.order,
      paymentId: responseData.payment?.id,
    });

    console.log("Full response data:", JSON.stringify(responseData, null, 2));
    console.log("Order object in response:", {
      hasOrder: !!responseData.order,
      orderId: responseData.order?._id,
      orderType: typeof responseData.order,
      orderKeys: responseData.order ? Object.keys(responseData.order) : "N/A",
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Payment verification error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Get payment details => /api/v1/payment/:paymentId
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
        captured: payment.captured,
        description: payment.description,
        notes: payment.notes,
      },
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    next(new ErrorHandler("Failed to fetch payment details", 500));
  }
};

// Refund payment => /api/v1/payment/refund
exports.refundPayment = async (req, res, next) => {
  try {
    const { paymentId, amount, reason = "Refund requested" } = req.body;

    if (!paymentId) {
      return next(new ErrorHandler("Payment ID is required", 400));
    }

    const refundOptions = {
      payment_id: paymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      notes: {
        reason: reason,
        refunded_by: req.user.id,
        refunded_at: new Date().toISOString(),
      },
    };

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    // Update order status
    const order = await Order.findOne({
      "paymentInfo.razorpay_payment_id": paymentId,
    });

    if (order) {
      order.orderStatus = "Cancelled";
      order.refundInfo = {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: reason,
        refundedAt: new Date(),
      };
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: reason,
      },
    });
  } catch (error) {
    console.error("Refund error:", error);
    next(new ErrorHandler("Refund failed", 500));
  }
};

// Get all payments - Admin => /api/v1/admin/payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, status, method } = req.query;
    const safeLimit = Math.min(parseInt(limit), 100) || 100;
    const skip = (page - 1) * safeLimit;

    let query = {};
    if (status) query.status = status;
    if (method) query.method = method;

    const payments = await razorpay.payments.all({
      ...query,
      count: safeLimit,
      skip: skip,
    });

    res.status(200).json({
      success: true,
      payments: payments.items.map((payment) => ({
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
        captured: payment.captured,
        description: payment.description,
        notes: payment.notes,
      })),
      pagination: {
        page: parseInt(page),
        limit: safeLimit,
        returned: payments.count,
        hasMore: payments.items?.length === safeLimit,
      },
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    next(new ErrorHandler("Failed to fetch payments", 500));
  }
};

// Create COD order => /api/v1/payment/create-cod-order
exports.createCODOrder = async (req, res, next) => {
  try {
    const { orderData } = req.body;

    console.log("Create COD order request:", {
      orderData: orderData
        ? {
            userId: orderData.userId,
            orderItems: orderData.orderItems?.length,
            totalPrice: orderData.totalPrice,
            shippingInfo: orderData.shippingInfo ? "present" : "missing",
          }
        : "missing",
      user: req.user?.id,
    });

    if (!orderData || !orderData.orderItems || !orderData.shippingInfo) {
      console.error("Missing required order data for COD");
      return res.status(400).json({
        success: false,
        message: "Missing required order data",
      });
    }

    if (!req.user || !req.user.id) {
      console.error("User not authenticated for COD order");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Normalize coupon and persist applied discount amount
    const normalizedCoupon = (() => {
      const c = orderData.coupon;
      if (!c) return undefined;
      const discountApplied = Number(
        orderData.discount ?? c.discountApplied ?? c.discount ?? 0
      );
      return {
        code: c.code || null,
        discountType: c.discountType || null,
        discountValue: Number(c.discountValue || 0),
        discountApplied: isNaN(discountApplied) ? 0 : discountApplied,
      };
    })();

    const orderDataToCreate = {
      orderItems: orderData.orderItems,
      shippingInfo: orderData.shippingInfo,
      itemsPrice: orderData.itemsPrice,
      taxPrice: orderData.taxPrice,
      shippingPrice: orderData.shippingPrice,
      totalPrice: orderData.totalPrice,
      paymentInfo: {
        id: `COD_${Date.now()}`,
        status: "pending",
        method: "cod",
      },
      user: req.user.id,
      coupon: normalizedCoupon,
      orderStatus: "Processing",
    };

    console.log("Creating COD order with data:", {
      orderItems: orderData.orderItems?.length,
      shippingInfo: orderData.shippingInfo ? "present" : "missing",
      itemsPrice: orderData.itemsPrice,
      taxPrice: orderData.taxPrice,
      shippingPrice: orderData.shippingPrice,
      totalPrice: orderData.totalPrice,
      user: req.user.id,
    });

    // Validate orderItems structure
    if (
      !orderData.orderItems ||
      !Array.isArray(orderData.orderItems) ||
      orderData.orderItems.length === 0
    ) {
      console.error("Invalid orderItems:", orderData.orderItems);
      return res.status(400).json({
        success: false,
        message: "Invalid order items",
      });
    }

    // Validate each order item
    for (let i = 0; i < orderData.orderItems.length; i++) {
      const item = orderData.orderItems[i];
      if (!item.name || !item.quantity || !item.price || !item.product) {
        console.error(`Invalid order item at index ${i}:`, item);
        return res.status(400).json({
          success: false,
          message: `Invalid order item at index ${i}`,
        });
      }

      if (typeof item.product === "string") {
        orderDataToCreate.orderItems[i].product = new mongoose.Types.ObjectId(
          item.product
        );
      }
    }

    // Validate user ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      console.error("Invalid user ID:", req.user.id);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (typeof req.user.id === "string") {
      orderDataToCreate.user = new mongoose.Types.ObjectId(req.user.id);
      console.log("Converted user ID to ObjectId:", orderDataToCreate.user);
    }

    // Validate shippingInfo structure
    if (
      !orderData.shippingInfo ||
      !orderData.shippingInfo.name ||
      !orderData.shippingInfo.phone ||
      !orderData.shippingInfo.address ||
      !orderData.shippingInfo.city ||
      !orderData.shippingInfo.state ||
      !orderData.shippingInfo.pincode
    ) {
      console.error("Invalid shippingInfo:", orderData.shippingInfo);
      return res.status(400).json({
        success: false,
        message: "Invalid shipping information",
      });
    }

    // Initialize status timeline
    orderDataToCreate.statusTimeline = [
      {
        status: "Processing",
        timestamp: new Date(),
        changedBy: req.user.id,
      },
    ];

    const order = await Order.create(orderDataToCreate);

    console.log("COD order created successfully:", {
      orderId: order._id,
      totalPrice: order.totalPrice,
      user: order.user,
      orderStatus: order.orderStatus,
    });

    // Update product stock
    for (const item of orderData.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    // Update coupon usage if applied
    if (orderData.coupon && orderData.coupon.code) {
      try {
        const Coupon = require("../models/Coupon");
        const couponDoc = await Coupon.findOne({
          code: orderData.coupon.code.toUpperCase(),
        });
        if (couponDoc) {
          couponDoc.usedCount = (couponDoc.usedCount || 0) + 1;
          await couponDoc.save();
        }
      } catch (err) {
        console.error("Coupon update error:", err);
      }
    }

    // Generate invoice
    try {
      const invoice = await generateInvoiceForOrder(order);
      order.invoice = invoice._id;
      await order.save();
    } catch (err) {
      console.error("Invoice generation error:", err);
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user, order);
    } catch (err) {
      console.error("Email sending error:", err);
    }

    // Create database notifications
    try {
      await NotificationService.createOrderNotification(order, "created");
    } catch (error) {
      console.error("Error creating COD order notifications:", error);
    }

    // Send real-time notification to admins
    if (global.wss) {
      global.wss.sendToAdmins({
        type: "new_order",
        title: "New COD Order Received",
        message: `COD Order #${order._id} placed by ${req.user.name} for ₹${order.totalPrice}`,
        orderId: order._id,
        customerName: req.user.name,
        amount: order.totalPrice,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "COD order created successfully",
      order: order,
    });
  } catch (error) {
    console.error("COD order creation error:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      errors: error.errors,
    });

    res.status(500).json({
      success: false,
      message: "COD order creation failed",
      error: error.message,
    });
  }
};

// Get payment statistics - Admin => /api/v1/admin/payments/stats
exports.getPaymentStats = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    let query = {};
    if (from && to) {
      query.from = new Date(from).getTime() / 1000;
      query.to = new Date(to).getTime() / 1000;
    }

    const pageSize = 100;
    let skip = 0;
    const allItems = [];
    while (true) {
      const pageResp = await razorpay.payments.all({
        ...query,
        count: pageSize,
        skip,
      });
      const items = pageResp.items || [];
      allItems.push(...items);
      if (items.length < pageSize) break;
      skip += pageSize;
    }

    const stats = {
      totalPayments: allItems.length,
      totalAmount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      refundedPayments: 0,
      methodBreakdown: {},
      dailyStats: {},
    };

    allItems.forEach((payment) => {
      const amount = payment.amount / 100;
      stats.totalAmount += amount;

      if (payment.status === "captured") {
        stats.successfulPayments++;
      } else if (payment.status === "failed") {
        stats.failedPayments++;
      } else if (payment.status === "pending") {
        stats.pendingPayments++;
      }

      if (
        payment.refund_status === "partial" ||
        payment.refund_status === "full"
      ) {
        stats.refundedPayments++;
      }

      // Method breakdown
      if (payment.method) {
        stats.methodBreakdown[payment.method] =
          (stats.methodBreakdown[payment.method] || 0) + 1;
      }

      // Daily stats
      const date = new Date(payment.created_at * 1000)
        .toISOString()
        .split("T")[0];
      if (!stats.dailyStats[date]) {
        stats.dailyStats[date] = { count: 0, amount: 0 };
      }
      stats.dailyStats[date].count++;
      stats.dailyStats[date].amount += amount;
    });

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    next(new ErrorHandler("Failed to fetch payment statistics", 500));
  }
};

// Webhook handler for Razorpay events => /api/v1/payment/webhook
exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const event = req.body;

    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event);
        break;
      case "payment.failed":
        await handlePaymentFailed(event);
        break;
      case "refund.created":
        await handleRefundCreated(event);
        break;
      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res
      .status(500)
      .json({ success: false, message: "Webhook processing failed" });
  }
};

// Helper function to generate invoice for order
const generateInvoiceForOrder = async (order) => {
  try {
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("orderItems.product");

    const user = await User.findById(order.user);
    const defaultAddress =
      user.addresses.find((addr) => addr.isDefault) || user.addresses[0];

    if (!defaultAddress) {
      throw new Error("No billing address found");
    }

    const invoiceItems = order.orderItems.map((item) => ({
      product: item.product._id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      gstRate: 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
    }));

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await Invoice.create({
      invoiceNumber: invoiceNumber,
      order: order._id,
      user: order.user,
      invoiceDate: new Date(),
      dueDate: dueDate,
      billingAddress: {
        name: defaultAddress.name,
        address: defaultAddress.address,
        city: defaultAddress.city,
        state: defaultAddress.state,
        pincode: defaultAddress.pincode,
        phone: defaultAddress.phone,
      },
      shippingAddress: {
        name: order.shippingInfo.name,
        address: order.shippingInfo.address,
        city: order.shippingInfo.city,
        state: order.shippingInfo.state,
        pincode: order.shippingInfo.pincode,
        phone: order.shippingInfo.phone,
      },
      items: invoiceItems,
      subtotal: order.itemsPrice,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      shippingCharges: order.shippingPrice,
      discount: Number(order?.coupon?.discountApplied || 0),
      totalAmount: Number(order.totalPrice),
      amountInWords: "",
      paymentStatus: order.paymentInfo.method === "cod" ? "Pending" : "Paid",
      paymentMethod: order.paymentInfo.method,
      paymentDate: order.paymentInfo.method === "cod" ? null : order.paidAt,
    });

    invoice.calculateGST();
    invoice.amountInWords = invoice.amountToWords(invoice.totalAmount);

    // Validate the invoice before saving
    const validationError = invoice.validateSync();
    if (validationError) {
      console.error("Invoice validation error:", validationError);
      throw new Error(`Invoice validation failed: ${validationError.message}`);
    }

    await invoice.save();

    return invoice;
  } catch (error) {
    console.error("Invoice generation error:", error);
    throw error;
  }
};

// Helper function to send order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  try {
    await sendEmail({
      email: user.email,
      subject: "Order Confirmation - Pure Ghee Store",
      message: `Thank you for your order! Your order ID is ${order._id}. We will process your order soon.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Order Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for your order! Your order has been successfully placed and payment confirmed.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
            <p><strong>Payment Method:</strong> ${
              order.paymentInfo.method === "cod"
                ? "Cash on Delivery"
                : "Razorpay"
            }</p>
            <p><strong>Order Status:</strong> ${order.orderStatus}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Delivery Address</h3>
            <p>${order.shippingInfo.name}<br>
            ${order.shippingInfo.address}<br>
            ${order.shippingInfo.city}, ${order.shippingInfo.state} - ${
        order.shippingInfo.pincode
      }<br>
            Phone: ${order.shippingInfo.phone}</p>
          </div>
          
          ${
            order.paymentInfo.method === "cod"
              ? `<p><strong>Payment Information:</strong> You will pay ₹${order.totalPrice} in cash when your order is delivered to your doorstep.</p>`
              : ""
          }
          <p>We will process your order and ship it to you soon. You will receive tracking information once your order is shipped.</p>
          <p>Best regards,<br>Pure Ghee Store Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Order confirmation email error:", error);
  }
};

// Webhook event handlers
const handlePaymentCaptured = async (event) => {
  try {
    const payment = event.payload.payment.entity;
    console.log(`Payment captured: ${payment.id}`);

    // Update order status if needed
    const order = await Order.findOne({
      "paymentInfo.razorpay_payment_id": payment.id,
    });

    if (order && order.orderStatus === "Processing") {
      order.orderStatus = "Confirmed";
      await order.save();
    }
  } catch (error) {
    console.error("Handle payment captured error:", error);
  }
};

const handlePaymentFailed = async (event) => {
  try {
    const payment = event.payload.payment.entity;
    console.log(`Payment failed: ${payment.id}`);

    // Update order status
    const order = await Order.findOne({
      "paymentInfo.razorpay_payment_id": payment.id,
    });

    if (order) {
      order.orderStatus = "Cancelled";
      await order.save();
    }
  } catch (error) {
    console.error("Handle payment failed error:", error);
  }
};

const handleRefundCreated = async (event) => {
  try {
    const refund = event.payload.refund.entity;
    console.log(`Refund created: ${refund.id}`);

    // Update order with refund information
    const order = await Order.findOne({
      "paymentInfo.razorpay_payment_id": refund.payment_id,
    });

    if (order) {
      order.refundInfo = {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: refund.notes?.reason || "Refund processed",
        refundedAt: new Date(),
      };
      await order.save();
    }
  } catch (error) {
    console.error("Handle refund created error:", error);
  }
};
