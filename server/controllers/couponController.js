const Coupon = require("../models/Coupon");
const ErrorHandler = require("../utils/errorHandler");

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

    if (!coupon.canBeUsedByUser(req.user?.id, orderAmount)) {
      return next(
        new ErrorHandler("Coupon cannot be applied to this order", 400)
      );
    }

    const discount = coupon.calculateDiscount(orderAmount);

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
