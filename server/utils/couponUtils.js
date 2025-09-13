const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

const calculateBestCoupon = (eligibleCoupons, orderAmount) => {
  if (!eligibleCoupons || eligibleCoupons.length === 0) return null;

  const couponsWithDiscount = eligibleCoupons
    .map((coupon) => {
      const discount = calculateDiscountAmount(coupon, orderAmount);
      return {
        ...coupon,
        calculatedDiscount: discount,
        discountPercentage:
          orderAmount > 0 ? (discount / orderAmount) * 100 : 0,
      };
    })
    .filter((coupon) => coupon.calculatedDiscount > 0)
    .sort((a, b) => {
      // Sort by discount amount
      if (b.calculatedDiscount !== a.calculatedDiscount) {
        return b.calculatedDiscount - a.calculatedDiscount;
      }
      return b.discountPercentage - a.discountPercentage;
    });

  return couponsWithDiscount[0] || null;
};

const calculateDiscountAmount = (coupon, orderAmount) => {
  if (!coupon || orderAmount < coupon.minimumOrderAmount) return 0;

  let discount = 0;
  if (coupon.discountType === "percentage") {
    const rawDiscount = (orderAmount * coupon.discountValue) / 100;
    discount =
      coupon.maximumDiscount > 0
        ? Math.min(rawDiscount, coupon.maximumDiscount)
        : rawDiscount;
  } else if (coupon.discountType === "fixed") {
    discount = coupon.discountValue;
  }

  return Math.min(discount, orderAmount);
};

const getCouponAnalytics = async (couponId = null) => {
  try {
    const query = couponId ? { _id: couponId } : {};
    const coupons = await Coupon.find(query);

    const analytics = {
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter((c) => c.isActive).length,
      expiredCoupons: coupons.filter((c) => new Date() > c.validUntil).length,
      couponPerformance: [],
      totalDiscountGiven: 0,
      totalOrdersWithCoupons: 0,
    };

    for (const coupon of coupons) {
      const ordersWithCoupon = await Order.find({
        "coupon.code": coupon.code,
        orderStatus: {
          $in: ["Delivered", "Confirmed", "Shipped", "Out for Delivery"],
        },
      });

      const totalDiscountGiven = ordersWithCoupon.reduce((sum, order) => {
        return sum + (order.coupon?.discountApplied || 0);
      }, 0);

      const conversionRate =
        analytics.totalOrdersWithCoupons > 0
          ? (ordersWithCoupon.length / analytics.totalOrdersWithCoupons) * 100
          : 0;

      analytics.couponPerformance.push({
        code: coupon.code,
        description: coupon.description,
        totalUses: ordersWithCoupon.length,
        totalDiscountGiven,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageDiscount:
          ordersWithCoupon.length > 0
            ? Math.round((totalDiscountGiven / ordersWithCoupon.length) * 100) /
              100
            : 0,
        isActive: coupon.isActive,
        validUntil: coupon.validUntil,
      });

      analytics.totalDiscountGiven += totalDiscountGiven;
      analytics.totalOrdersWithCoupons += ordersWithCoupon.length;
    }

    // Sort by performance
    analytics.couponPerformance.sort((a, b) => b.totalUses - a.totalUses);

    return analytics;
  } catch (error) {
    console.error("Error in getCouponAnalytics:", error);
    throw error;
  }
};

const validateCouponBusinessRules = (couponData) => {
  const errors = [];
  const warnings = [];

  // Check for conflicting rules
  if (
    couponData.discountType === "percentage" &&
    couponData.maximumDiscount > 0
  ) {
    const potentialDiscount =
      (couponData.minimumOrderAmount * couponData.discountValue) / 100;
    if (potentialDiscount > couponData.maximumDiscount) {
      warnings.push(
        `Maximum discount (₹${
          couponData.maximumDiscount
        }) is lower than potential discount (₹${Math.round(
          potentialDiscount
        )}) for minimum order amount.`
      );
    }
  }

  // Check for very high percentage discounts
  if (
    couponData.discountType === "percentage" &&
    couponData.discountValue > 50
  ) {
    warnings.push(
      `High percentage discount (${couponData.discountValue}%) may impact profitability.`
    );
  }

  // Check for very low minimum order amounts
  if (couponData.minimumOrderAmount < 100) {
    warnings.push(
      `Low minimum order amount (₹${couponData.minimumOrderAmount}) may not be profitable.`
    );
  }

  // Check for very high fixed discounts
  if (couponData.discountType === "fixed" && couponData.discountValue > 500) {
    warnings.push(
      `High fixed discount (₹${couponData.discountValue}) may impact profitability.`
    );
  }

  if (couponData.validFrom && couponData.validUntil) {
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

const generateCouponSuggestions = (businessMetrics = {}) => {
  const suggestions = [];

  // First-time buyer incentive
  suggestions.push({
    type: "first_time_buyer",
    name: "First-Time Buyer Incentive",
    description: "Attract new customers with a special discount",
    suggestedConfig: {
      discountType: "percentage",
      discountValue: 10,
      maximumDiscount: 100,
      minimumOrderAmount: 500,
      userRestrictions: { firstTimeOnly: true },
      usageLimit: 1,
    },
    reasoning: "Encourages new customer acquisition with moderate discount",
  });

  // High-value order incentive
  suggestions.push({
    type: "high_value_order",
    name: "High-Value Order Discount",
    description: "Reward customers for larger purchases",
    suggestedConfig: {
      discountType: "percentage",
      discountValue: 15,
      maximumDiscount: 200,
      minimumOrderAmount: 1000,
      usageLimit: 0,
    },
    reasoning: "Increases average order value and customer lifetime value",
  });

  // Seasonal promotion
  suggestions.push({
    type: "seasonal_promotion",
    name: "Seasonal Promotion",
    description: "Limited-time offer for seasonal sales",
    suggestedConfig: {
      discountType: "fixed",
      discountValue: 50,
      minimumOrderAmount: 300,
      usageLimit: 100,
    },
    reasoning: "Creates urgency and drives immediate sales",
  });

  return suggestions;
};

module.exports = {
  calculateBestCoupon,
  calculateDiscountAmount,
  getCouponAnalytics,
  validateCouponBusinessRules,
  generateCouponSuggestions,
};
