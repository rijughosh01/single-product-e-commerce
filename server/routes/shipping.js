const express = require('express');
const {
  calculateShipping,
  getShippingRules,
  createShippingRule,
  updateShippingRule,
  deleteShippingRule,
  getShippingRule,
  bulkCreateShippingRules,
  testPincode
} = require('../controllers/shippingController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/shipping/calculate').post(calculateShipping);

// Admin routes
router.route('/admin/shipping/rules').get(isAuthenticatedUser, authorizeRoles('admin'), getShippingRules);
router.route('/admin/shipping/rule/new').post(isAuthenticatedUser, authorizeRoles('admin'), createShippingRule);
router.route('/admin/shipping/rule/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getShippingRule)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateShippingRule)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteShippingRule);

router.route('/admin/shipping/rules/bulk').post(isAuthenticatedUser, authorizeRoles('admin'), bulkCreateShippingRules);
router.route('/admin/shipping/test-pincode').post(isAuthenticatedUser, authorizeRoles('admin'), testPincode);

module.exports = router;
