const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");

// Get user's wishlist => /api/v1/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      "products.product"
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [],
      });
    }

    const validProducts = wishlist.products.filter(
      (item) => item.product !== null
    );

    // Update wishlist if there were invalid products
    if (validProducts.length !== wishlist.products.length) {
      wishlist.products = validProducts;
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// Add product to wishlist => /api/v1/wishlist/add
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return next(new ErrorHandler("Product ID is required", 400));
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [],
      });
    }

    // Check if product is already in wishlist
    if (wishlist.hasProduct(productId)) {
      return next(new ErrorHandler("Product already in wishlist", 400));
    }

    wishlist.addProduct(productId);
    await wishlist.save();

    await wishlist.populate("products.product");

    // Filter out any null products
    const validProducts = wishlist.products.filter(
      (item) => item.product !== null
    );
    if (validProducts.length !== wishlist.products.length) {
      wishlist.products = validProducts;
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// Remove product from wishlist => /api/v1/wishlist/remove
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return next(new ErrorHandler("Wishlist not found", 404));
    }

    if (!wishlist.hasProduct(productId)) {
      return next(new ErrorHandler("Product not in wishlist", 404));
    }

    wishlist.removeProduct(productId);
    await wishlist.save();

    await wishlist.populate("products.product");

    // Filter out any null products
    const validProducts = wishlist.products.filter(
      (item) => item.product !== null
    );
    if (validProducts.length !== wishlist.products.length) {
      wishlist.products = validProducts;
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// Clear wishlist => /api/v1/wishlist/clear
exports.clearWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return next(new ErrorHandler("Wishlist not found", 404));
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// Check if product is in wishlist => /api/v1/wishlist/check/:productId
exports.checkWishlistItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false,
      });
    }

    const inWishlist = wishlist.hasProduct(productId);

    res.status(200).json({
      success: true,
      inWishlist,
    });
  } catch (error) {
    next(error);
  }
};
