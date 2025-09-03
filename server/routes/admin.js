const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  getDashboardStats,
  getAnalytics,
} = require("../controllers/adminController");
const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  allOrders,
  getSingleOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const {
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// Dashboard routes
router
  .route("/admin/dashboard/stats")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getDashboardStats);

// Analytics routes
router
  .route("/admin/analytics")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAnalytics);

// Admin Products routes
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getProducts);
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);
router
  .route("/admin/product/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleProduct)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

// Admin Orders routes
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allOrders);
router
  .route("/admin/order/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

// Admin Users routes
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;
