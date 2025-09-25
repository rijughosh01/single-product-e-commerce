const express = require("express");
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
  getAllPayments,
  getPaymentStats,
  handleWebhook,
  createCODOrder,
} = require("../controllers/paymentController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Public webhook route
router.route("/payment/webhook").post(handleWebhook);

// User routes
router
  .route("/payment/create-order")
  .post(isAuthenticatedUser, createPaymentOrder);
router
  .route("/payment/create-cod-order")
  .post(isAuthenticatedUser, createCODOrder);
router.route("/payment/verify").post(isAuthenticatedUser, verifyPayment);
router.route("/payment/:paymentId").get(isAuthenticatedUser, getPaymentDetails);
router.route("/payment/refund").post(isAuthenticatedUser, refundPayment);

// Admin routes
router
  .route("/admin/payments")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllPayments);
router
  .route("/admin/payments/stats")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getPaymentStats);

module.exports = router;
