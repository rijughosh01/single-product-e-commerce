const express = require('express');
const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
  getProductsByType,
  getProductsBySize,
  getFeaturedProducts
} = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);

router.route('/products/type/:type').get(getProductsByType);
router.route('/products/size/:size').get(getProductsBySize);
router.route('/products/featured').get(getFeaturedProducts);

router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(getProductReviews);
router.route('/reviews').delete(isAuthenticatedUser, deleteReview);

// Admin routes
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
