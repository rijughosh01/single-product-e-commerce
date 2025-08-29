const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const Razorpay = require('razorpay');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
      paymentInfo
    } = req.body;

    const order = await Order.create({
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
      paidAt: Date.now(),
      user: req.user.id
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

    // Send order confirmation email
    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Order Confirmation - Ghee E-commerce',
        message: `Thank you for your order! Your order ID is ${order._id}. We will process your order soon.`,
        html: `
          <h2>Order Confirmation</h2>
          <p>Dear ${req.user.name},</p>
          <p>Thank you for your order! Your order has been successfully placed.</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
          <p>We will process your order and ship it to you soon.</p>
          <p>Best regards,<br>Ghee E-commerce Team</p>
        `
      });
    } catch (error) {
      console.log('Email sending failed:', error);
    }

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Get single order => /api/v1/order/:id
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      order
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
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders - Admin => /api/v1/admin/orders
exports.allOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email');

    let totalAmount = 0;
    orders.forEach(order => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders
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
      return next(new ErrorHandler('Order not found', 404));
    }

    if (order.orderStatus === 'Delivered') {
      return next(new ErrorHandler('You have already delivered this order', 400));
    }

    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();

    await order.save();

    // Send status update email
    try {
      await sendEmail({
        email: order.user.email,
        subject: `Order Status Update - ${req.body.status}`,
        message: `Your order status has been updated to ${req.body.status}.`,
        html: `
          <h2>Order Status Update</h2>
          <p>Dear Customer,</p>
          <p>Your order status has been updated to <strong>${req.body.status}</strong>.</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p>Thank you for choosing us!</p>
          <p>Best regards,<br>Ghee E-commerce Team</p>
        `
      });
    } catch (error) {
      console.log('Email sending failed:', error);
    }

    res.status(200).json({
      success: true
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
      return next(new ErrorHandler('Order not found', 404));
    }

    await order.deleteOne();

    res.status(200).json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

// Create Razorpay order => /api/v1/payment/create-order
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment => /api/v1/payment/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      return next(new ErrorHandler('Payment verification failed', 400));
    }
  } catch (error) {
    next(error);
  }
};

// Get order statistics - Admin => /api/v1/admin/orders/stats
exports.getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order => /api/v1/order/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    if (order.user.toString() !== req.user.id) {
      return next(new ErrorHandler('You are not authorized to cancel this order', 403));
    }

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Shipped') {
      return next(new ErrorHandler('Order cannot be cancelled at this stage', 400));
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
