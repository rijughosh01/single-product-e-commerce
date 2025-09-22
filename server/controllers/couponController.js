const Coupon = require("../models/Coupon");
const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");
const {
  calculateBestCoupon,
  getCouponAnalytics,
  validateCouponBusinessRules,
  generateCouponSuggestions,
} = require("../utils/couponUtils");

// Validate coupon => /api/v1/coupon/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return next(
        new ErrorHandler("Coupon code and order amount are required", 400)
      );
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return next(new ErrorHandler("Invalid coupon code", 404));
    }

    if (!coupon.isValid()) {
      return next(new ErrorHandler("Coupon is not valid or has expired", 400));
    }

    const validationDetails = await coupon.getValidationDetails(
      req.user?.id,
      Number(orderAmount)
    );
    if (!validationDetails.isValid) {
      const errorMessage = validationDetails.reasons.join(". ");
      return next(new ErrorHandler(errorMessage, 400));
    }

    const discount = coupon.calculateDiscount(Number(orderAmount));

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: discount,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscount: coupon.maximumDiscount,
        userUsage: validationDetails.userUsage,
        remainingUses: validationDetails.remainingUses,
        maxUsagePerUser: coupon.userRestrictions?.maxUsagePerUser || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all coupons - Admin => /api/v1/admin/coupons
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

// Create coupon - Admin => /api/v1/admin/coupon/new
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// Get single coupon - Admin => /api/v1/admin/coupon/:id
exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return next(new ErrorHandler("Coupon not found", 404));
    }

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// Update coupon - Admin => /api/v1/admin/coupon/:id
exports.updateCoupon = async (req, res, next) => {
  try {
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return next(new ErrorHandler("Coupon not found", 404));
    }

    coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// Delete coupon - Admin => /api/v1/admin/coupon/:id
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return next(new ErrorHandler("Coupon not found", 404));
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get coupon statistics - Admin => /api/v1/admin/coupons/stats
exports.getCouponStats = async (req, res, next) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({
      validUntil: { $lt: new Date() },
    });

    const mostUsedCoupon = await Coupon.findOne().sort({ usedCount: -1 });

    res.status(200).json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        mostUsedCoupon: mostUsedCoupon
          ? {
              code: mostUsedCoupon.code,
              usedCount: mostUsedCoupon.usedCount,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get eligible coupons for current user => /api/v1/coupons/eligible
exports.getEligibleCoupons = async (req, res, next) => {
  try {
    const { orderAmount } = req.query;
    const amount = Number(orderAmount) || 0;

    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).sort({ createdAt: -1 });

    const eligible = [];
    for (const coupon of coupons) {
      if (!coupon.isValid()) {
        continue;
      }

      const canUse = await coupon.canBeUsedByUser(req.user?.id, amount);
      if (!canUse) {
        continue;
      }

      const discount = coupon.calculateDiscount(amount);

      eligible.push({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscount: coupon.maximumDiscount,
        calculatedDiscount: discount,
      });
    }

    res.status(200).json({ success: true, coupons: eligible });
  } catch (error) {
    console.error("Error in getEligibleCoupons:", error);
    next(error);
  }
};

// Get coupon analytics - Admin => /api/v1/admin/coupons/analytics
exports.getCouponAnalytics = async (req, res, next) => {
  try {
    const { couponId } = req.query;
    const analytics = await getCouponAnalytics(couponId);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

// Get coupon suggestions - Admin => /api/v1/admin/coupons/suggestions
exports.getCouponSuggestions = async (req, res, next) => {
  try {
    const suggestions = generateCouponSuggestions();

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

// Validate coupon business rules - Admin => /api/v1/admin/coupons/validate-rules
exports.validateCouponRules = async (req, res, next) => {
  try {
    const validation = validateCouponBusinessRules(req.body);

    res.status(200).json({
      success: true,
      validation,
    });
  } catch (error) {
    next(error);
  }
};

// Get best coupon for order amount - Admin => /api/v1/admin/coupons/best
exports.getBestCoupon = async (req, res, next) => {
  try {
    const { orderAmount } = req.query;
    const amount = Number(orderAmount) || 0;

    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    });

    const eligible = [];
    for (const coupon of coupons) {
      if (!coupon.isValid()) continue;
      const canUse = await coupon.canBeUsedByUser(req.user?.id, amount);
      if (!canUse) continue;

      eligible.push({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscount: coupon.maximumDiscount,
      });
    }

    const bestCoupon = calculateBestCoupon(eligible, amount);

    res.status(200).json({
      success: true,
      bestCoupon,
      eligibleCoupons: eligible,
      orderAmount: amount,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's coupon usage information => /api/v1/coupons/my-usage
exports.getMyCouponUsage = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    const Order = require("../models/Order");

    // Get all coupons the user has used
    const userCouponUsage = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          "coupon.code": { $exists: true, $ne: null },
          orderStatus: {
            $in: ["Confirmed", "Shipped", "Out for Delivery", "Delivered"],
          },
        },
      },
      {
        $group: {
          _id: "$coupon.code",
          usageCount: { $sum: 1 },
          totalDiscount: { $sum: "$coupon.discountApplied" },
          lastUsed: { $max: "$createdAt" },
          orders: {
            $push: {
              orderId: "$_id",
              date: "$createdAt",
              discount: "$coupon.discountApplied",
            },
          },
        },
      },
      {
        $lookup: {
          from: "coupons",
          localField: "_id",
          foreignField: "code",
          as: "couponDetails",
        },
      },
      {
        $unwind: {
          path: "$couponDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          code: "$_id",
          usageCount: 1,
          totalDiscount: 1,
          lastUsed: 1,
          orders: 1,
          maxUsagePerUser: "$couponDetails.userRestrictions.maxUsagePerUser",
          remainingUses: {
            $subtract: [
              {
                $ifNull: ["$couponDetails.userRestrictions.maxUsagePerUser", 1],
              },
              "$usageCount",
            ],
          },
          isFirstTimeOnly: "$couponDetails.userRestrictions.firstTimeOnly",
          description: "$couponDetails.description",
          discountType: "$couponDetails.discountType",
          discountValue: "$couponDetails.discountValue",
        },
      },
      {
        $sort: { lastUsed: -1 },
      },
    ]);

    // Get available coupons with usage info
    const now = new Date();
    const availableCoupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    });

    const availableCouponsWithUsage = [];
    for (const coupon of availableCoupons) {
      const userUsage = userCouponUsage.find(
        (usage) => usage.code === coupon.code
      );
      const usageCount = userUsage ? userUsage.usageCount : 0;
      const maxUsage = coupon.userRestrictions?.maxUsagePerUser || 1;
      const remainingUses = Math.max(0, maxUsage - usageCount);

      availableCouponsWithUsage.push({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscount: coupon.maximumDiscount,
        userUsage: usageCount,
        maxUsagePerUser: maxUsage,
        remainingUses: remainingUses,
        canUse: remainingUses > 0,
        isFirstTimeOnly: coupon.userRestrictions?.firstTimeOnly || false,
        validUntil: coupon.validUntil,
      });
    }

    res.status(200).json({
      success: true,
      usedCoupons: userCouponUsage,
      availableCoupons: availableCouponsWithUsage,
      summary: {
        totalCouponsUsed: userCouponUsage.length,
        totalDiscountReceived: userCouponUsage.reduce(
          (sum, usage) => sum + usage.totalDiscount,
          0
        ),
        totalOrdersWithCoupons: userCouponUsage.reduce(
          (sum, usage) => sum + usage.usageCount,
          0
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};
