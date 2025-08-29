const express = require('express');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} = require('../controllers/cartController');

const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.route('/cart/add').post(isAuthenticatedUser, addToCart);
router.route('/cart').get(isAuthenticatedUser, getCart);
router.route('/cart/update').put(isAuthenticatedUser, updateCartItem);
router.route('/cart/remove/:productId').delete(isAuthenticatedUser, removeFromCart);
router.route('/cart/clear').delete(isAuthenticatedUser, clearCart);
router.route('/cart/summary').get(isAuthenticatedUser, getCartSummary);

module.exports = router;
