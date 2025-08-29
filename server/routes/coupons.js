const express = require('express');
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats
} = require('../controllers/couponController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/coupon/validate').post(validateCoupon);

// Admin routes
router.route('/admin/coupons').get(isAuthenticatedUser, authorizeRoles('admin'), getAllCoupons);
router.route('/admin/coupon/new').post(isAuthenticatedUser, authorizeRoles('admin'), createCoupon);
router.route('/admin/coupon/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getCoupon)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateCoupon)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCoupon);
router.route('/admin/coupons/stats').get(isAuthenticatedUser, authorizeRoles('admin'), getCouponStats);

module.exports = router;
