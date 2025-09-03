const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
  createPaymentOrder,
  verifyPayment,
  getOrderStats,
  cancelOrder,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrders);
router.route("/order/:id/cancel").put(isAuthenticatedUser, cancelOrder);

// Payment routes
router
  .route("/payment/create-order")
  .post(isAuthenticatedUser, createPaymentOrder);
router.route("/payment/verify").post(isAuthenticatedUser, verifyPayment);

// Admin routes
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allOrders);
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);
router
  .route("/admin/orders/stats")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getOrderStats);

module.exports = router;
