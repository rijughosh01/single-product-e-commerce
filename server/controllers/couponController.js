const Coupon = require("../models/Coupon");
const ErrorHandler = require("../utils/errorHandler");
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

    const canUse = await coupon.canBeUsedByUser(
      req.user?.id,
      Number(orderAmount)
    );
    if (!canUse) {
      return next(
        new ErrorHandler("Coupon cannot be applied to this order", 400)
      );
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
