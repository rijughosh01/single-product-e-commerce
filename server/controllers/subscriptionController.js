const Subscription = require("../models/Subscription");
const Product = require("../models/Product");
const Order = require("../models/Order");
const ErrorHandler = require("../utils/errorHandler");

// Create subscription => /api/v1/subscription/new
exports.createSubscription = async (req, res, next) => {
  try {
    const {
      productId,
      quantity,
      frequency,
      nextDeliveryDate,
      shippingAddress,
      paymentMethod,
      notes,
    } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return next(new ErrorHandler("Product is out of stock", 400));
    }

    const subscription = await Subscription.create({
      user: req.user.id,
      product: productId,
      quantity,
      frequency,
      nextDeliveryDate: new Date(nextDeliveryDate),
      shippingAddress,
      paymentMethod,
      notes,
    });

    await subscription.populate("product");

    res.status(201).json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's subscriptions => /api/v1/subscriptions
exports.getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// Get single subscription => /api/v1/subscription/:id
exports.getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate(
      "product"
    );

    if (!subscription) {
      return next(new ErrorHandler("Subscription not found", 404));
    }

    if (subscription.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to access this subscription", 403)
      );
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Update subscription => /api/v1/subscription/:id
exports.updateSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return next(new ErrorHandler("Subscription not found", 404));
    }

    if (subscription.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to update this subscription", 403)
      );
    }

    subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    ).populate("product");

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Pause subscription => /api/v1/subscription/:id/pause
exports.pauseSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return next(new ErrorHandler("Subscription not found", 404));
    }

    if (subscription.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to pause this subscription", 403)
      );
    }

    subscription.pause(reason);
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription paused successfully",
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Resume subscription => /api/v1/subscription/:id/resume
exports.resumeSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return next(new ErrorHandler("Subscription not found", 404));
    }

    if (subscription.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to resume this subscription", 403)
      );
    }

    subscription.resume();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription resumed successfully",
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription => /api/v1/subscription/:id/cancel
exports.cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return next(new ErrorHandler("Subscription not found", 404));
    }

    if (subscription.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to cancel this subscription", 403)
      );
    }

    subscription.cancel(reason);
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Get all subscriptions - Admin => /api/v1/admin/subscriptions
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, frequency } = req.query;

    const query = {};
    if (status) query.status = status;
    if (frequency) query.frequency = frequency;

    const subscriptions = await Subscription.find(query)
      .populate("user", "name email")
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscription.countDocuments(query);

    res.status(200).json({
      success: true,
      subscriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// Process due subscriptions - Admin => /api/v1/admin/subscriptions/process
exports.processDueSubscriptions = async (req, res, next) => {
  try {
    const dueSubscriptions = await Subscription.find({
      status: "active",
      nextDeliveryDate: { $lte: new Date() },
    }).populate("product");

    const processedOrders = [];

    for (const subscription of dueSubscriptions) {
      try {
        if (subscription.product.stock < subscription.quantity) {
          continue;
        }

        // Create order for this subscription
        const order = await Order.create({
          user: subscription.user,
          orderItems: [
            {
              name: subscription.product.name,
              quantity: subscription.quantity,
              price: subscription.product.price,
              product: subscription.product._id,
            },
          ],
          shippingInfo: subscription.shippingAddress,
          paymentInfo: {
            method: subscription.paymentMethod,
            status: "pending",
          },
          itemsPrice: subscription.product.price * subscription.quantity,
          taxPrice: subscription.product.price * subscription.quantity * 0.12,
          shippingPrice: 0,
          totalPrice: subscription.product.price * subscription.quantity * 1.12,
        });

        // Update subscription
        subscription.completedDeliveries += 1;
        subscription.nextDeliveryDate = subscription.calculateNextDelivery();
        await subscription.save();

        processedOrders.push(order._id);
      } catch (error) {
        console.error(
          `Error processing subscription ${subscription._id}:`,
          error
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${processedOrders.length} subscriptions`,
      processedOrders,
    });
  } catch (error) {
    next(error);
  }
};
