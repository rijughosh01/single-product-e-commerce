const express = require("express");
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
  getEligibleCoupons,
  getCouponAnalytics,
  getCouponSuggestions,
  validateCouponRules,
  getBestCoupon,
} = require("../controllers/couponController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Authenticated routes
router.route("/coupon/validate").post(isAuthenticatedUser, validateCoupon);
router.route("/coupons/eligible").get(isAuthenticatedUser, getEligibleCoupons);

// Admin routes
router
  .route("/admin/coupons")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllCoupons);
router
  .route("/admin/coupon/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createCoupon);
router
  .route("/admin/coupon/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getCoupon)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCoupon)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCoupon);
router
  .route("/admin/coupons/stats")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getCouponStats);
router
  .route("/admin/coupons/analytics")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getCouponAnalytics);
router
  .route("/admin/coupons/suggestions")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getCouponSuggestions);
router
  .route("/admin/coupons/validate-rules")
  .post(isAuthenticatedUser, authorizeRoles("admin"), validateCouponRules);
router
  .route("/admin/coupons/best")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getBestCoupon);

module.exports = router;
