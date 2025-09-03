const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
} = require("../controllers/wishlistController");

const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

// User routes
router.route("/wishlist").get(isAuthenticatedUser, getWishlist);
router.route("/wishlist/add").post(isAuthenticatedUser, addToWishlist);
router
  .route("/wishlist/remove/:productId")
  .delete(isAuthenticatedUser, removeFromWishlist);
router.route("/wishlist/clear").delete(isAuthenticatedUser, clearWishlist);
router
  .route("/wishlist/check/:productId")
  .get(isAuthenticatedUser, checkWishlistItem);

module.exports = router;
