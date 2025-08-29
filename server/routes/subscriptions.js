const express = require('express');
const {
  createSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getAllSubscriptions,
  processDueSubscriptions
} = require('../controllers/subscriptionController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// User routes
router.route('/subscription/new').post(isAuthenticatedUser, createSubscription);
router.route('/subscriptions').get(isAuthenticatedUser, getSubscriptions);
router.route('/subscription/:id')
  .get(isAuthenticatedUser, getSubscription)
  .put(isAuthenticatedUser, updateSubscription);
router.route('/subscription/:id/pause').put(isAuthenticatedUser, pauseSubscription);
router.route('/subscription/:id/resume').put(isAuthenticatedUser, resumeSubscription);
router.route('/subscription/:id/cancel').put(isAuthenticatedUser, cancelSubscription);

// Admin routes
router.route('/admin/subscriptions').get(isAuthenticatedUser, authorizeRoles('admin'), getAllSubscriptions);
router.route('/admin/subscriptions/process').post(isAuthenticatedUser, authorizeRoles('admin'), processDueSubscriptions);

module.exports = router;
