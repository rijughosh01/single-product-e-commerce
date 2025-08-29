const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxLength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    maxLength: [5, 'Price cannot exceed 5 characters']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please enter original price']
  },
  discount: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    required: [true, 'Please enter product size'],
    enum: ['250g', '500g', '1kg', '2kg', '5kg']
  },
  type: {
    type: String,
    required: [true, 'Please enter ghee type'],
    enum: ['Pure Cow Ghee', 'Buffalo Ghee', 'Mixed Ghee', 'Organic Ghee', 'A2 Ghee']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    required: [true, 'Please enter product category'],
    enum: ['Ghee']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    maxLength: [5, 'Stock cannot exceed 5 characters'],
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  }],
  ratings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbohydrates: Number,
    fiber: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate SKU before saving
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const sizeCode = this.size.replace(/[^0-9]/g, '');
    const typeCode = this.type.substring(0, 3).toUpperCase();
    this.sku = `GHEE-${typeCode}-${sizeCode}-${Date.now().toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
