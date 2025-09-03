const express = require("express");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  getAllNotifications,
} = require("../controllers/notificationController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// User routes
router.route("/notifications").get(isAuthenticatedUser, getNotifications);
router.route("/notification/:id/read").put(isAuthenticatedUser, markAsRead);
router.route("/notifications/read-all").put(isAuthenticatedUser, markAllAsRead);
router
  .route("/notification/:id")
  .delete(isAuthenticatedUser, deleteNotification);
router
  .route("/notifications/unread-count")
  .get(isAuthenticatedUser, getUnreadCount);

// Admin routes
router
  .route("/admin/notification/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createNotification);
router
  .route("/admin/notifications")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllNotifications);

module.exports = router;
