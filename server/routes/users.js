const express = require("express");
const {
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserStats,
} = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Address management routes
router.route("/address/add").post(isAuthenticatedUser, addAddress);
router.route("/addresses").get(isAuthenticatedUser, getAddresses);
router.route("/address/:id").put(isAuthenticatedUser, updateAddress);
router.route("/address/:id").delete(isAuthenticatedUser, deleteAddress);
router
  .route("/address/:id/default")
  .put(isAuthenticatedUser, setDefaultAddress);

// Admin routes
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
router
  .route("/admin/users/stats")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserStats);

module.exports = router;
