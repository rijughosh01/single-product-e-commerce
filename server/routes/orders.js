const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
  getOrderStats,
  cancelOrder,
  processRefund,
  getRefundDetails,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrders);
router.route("/order/:id/cancel").put(isAuthenticatedUser, cancelOrder);

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

// Admin refund routes
router
  .route("/admin/order/:id/refund")
  .post(isAuthenticatedUser, authorizeRoles("admin"), processRefund)
  .get(isAuthenticatedUser, authorizeRoles("admin"), getRefundDetails);

module.exports = router;
