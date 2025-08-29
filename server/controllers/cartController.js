const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');

// Add item to cart => /api/v1/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return next(new ErrorHandler('Product is out of stock', 400));
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = await Cart.create({
        user: req.user.id,
        items: [{
          product: productId,
          quantity,
          price: product.price
        }]
      });
    } else {
      // Check if product already exists in cart
      const existingItem = cart.items.find(item => 
        item.product.toString() === productId
      );

      if (existingItem) {
        // Update quantity if product already exists
        existingItem.quantity += quantity;
        if (existingItem.quantity > product.stock) {
          return next(new ErrorHandler('Requested quantity exceeds available stock', 400));
        }
      } else {
        // Add new item to cart
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }

      await cart.save();
    }

    // Populate product details
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Get user's cart => /api/v1/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          totalAmount: 0,
          totalItems: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity => /api/v1/cart/update
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity <= 0) {
      return next(new ErrorHandler('Quantity must be greater than 0', 400));
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    const cartItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!cartItem) {
      return next(new ErrorHandler('Item not found in cart', 404));
    }

    // Check stock availability
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return next(new ErrorHandler('Requested quantity exceeds available stock', 400));
    }

    cartItem.quantity = quantity;
    await cart.save();

    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart => /api/v1/cart/remove
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart => /api/v1/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Get cart summary => /api/v1/cart/summary
exports.getCartSummary = async (req, res, next) => {
  try {
    const { pincode, couponCode } = req.query;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalItems: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        }
      });
    }

    const subtotal = cart.totalAmount;
    const tax = subtotal * 0.18; // 18% GST
    let shipping = 0;
    let discount = 0;
    let couponDetails = null;

    // Calculate shipping based on pincode if provided
    if (pincode) {
      try {
        const ShippingRule = require('../models/ShippingRule');
        const shippingRules = await ShippingRule.find({ isActive: true }).sort({ priority: 1 });
        
        let applicableRule = null;
        for (const rule of shippingRules) {
          if (rule.matchesPincode(pincode)) {
            applicableRule = rule;
            shipping = rule.getShippingCharges(subtotal);
            break;
          }
        }

        // If no specific rule found, use default rule
        if (!applicableRule) {
          const defaultRule = shippingRules.find(rule => rule.pincodeType === 'all');
          if (defaultRule) {
            shipping = defaultRule.getShippingCharges(subtotal);
          } else {
            // Fallback to basic shipping logic
            shipping = subtotal > 500 ? 0 : 50;
          }
        }
      } catch (error) {
        // Fallback to basic shipping logic if shipping calculation fails
        shipping = subtotal > 500 ? 0 : 50;
      }
    } else {
      // Default shipping logic when pincode is not provided
      shipping = subtotal > 500 ? 0 : 50;
    }

    // Apply coupon discount if provided
    if (couponCode) {
      try {
        const Coupon = require('../models/Coupon');
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

        if (coupon && coupon.isValid() && coupon.canBeUsedByUser(req.user.id, subtotal)) {
          discount = coupon.calculateDiscount(subtotal);
          couponDetails = {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
          };
        }
      } catch (error) {
        console.error('Error applying coupon:', error);
      }
    }

    const total = subtotal + tax + shipping - discount;

    res.status(200).json({
      success: true,
      summary: {
        totalItems: cart.totalItems,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        pincode: pincode || null,
        coupon: couponDetails
      }
    });
  } catch (error) {
    next(error);
  }
};
