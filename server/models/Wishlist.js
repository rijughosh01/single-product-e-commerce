const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
wishlistSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

wishlistSchema.index({ user: 1 }, { unique: true });

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function (productId) {
  const existingProduct = this.products.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (!existingProduct) {
    this.products.push({
      product: productId,
      addedAt: new Date(),
    });
  }

  return this;
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  return this;
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function (productId) {
  return this.products.some(
    (item) => item.product.toString() === productId.toString()
  );
};

module.exports = mongoose.model("Wishlist", wishlistSchema);
