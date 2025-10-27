# Premium Ghee E-Commerce Platform

A production-ready, full-stack single-product e-commerce platform specializing in authentic premium ghee. Built with modern technologies and featuring a complete business flow from product showcasing to delivery and support.

## 🌟 Overview

This platform offers a comprehensive solution for selling premium ghee with authentic traditional process showcasing, complete order management, subscriptions, returns, analytics, and much more. The architecture follows a monorepo structure with separate frontend and backend applications.

## ✨ Key Highlights

- **🎨 Modern, Animated UI**: Built with Next.js 15, React 19, Tailwind CSS, and Framer Motion
- **🛒 Complete E-Commerce Flow**: Browse → Add to Cart → Checkout → Payment → Order Tracking → Delivery
- **🔐 Enterprise-Grade Security**: JWT authentication, role-based access control, rate limiting, input validation
- **💳 Multiple Payment Options**: Razorpay integration with COD support
- **📊 Advanced Analytics**: Comprehensive dashboard with sales, user, and product insights
- **🔄 Subscription Management**: Recurring orders with pause/resume/cancel capabilities
- **🎫 Intelligent Coupon System**: Advanced discount rules with usage limits and restrictions
- **📦 Returns & Refunds**: Complete return workflow with bank verification
- **🔔 Real-Time Notifications**: WebSocket-powered live updates
- **📄 Invoice Generation**: GST-compliant PDF invoices
- **🚚 Dynamic Shipping**: Pincode-based shipping with zone management
- **🏭 Traditional Process Showcase**: Interactive section showcasing ghee making process

## 🧱 Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: Jotai
- **Data Fetching**: SWR, Axios
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Chart.js + react-chartjs-2
- **Animations**: Framer Motion
- **Notifications**: Sonner toasts
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt
- **Payment Gateway**: Razorpay
- **Email Service**: Nodemailer (Gmail SMTP)
- **File Upload**: Multer + Cloudinary
- **Invoice Generation**: PDFKit
- **Real-Time**: WebSocket (ws library)
- **Security**: Helmet, express-rate-limit, CORS, express-validator
- **Testing**: Jest, Supertest

## 📁 Project Structure

```
.
├── client/                      # Next.js frontend application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.js          # Home page with traditional process
│   │   │   ├── products/        # Product catalog & details
│   │   │   ├── admin/           # Admin dashboard & management
│   │   │   │   ├── dashboard/   # Analytics dashboard
│   │   │   │   ├── products/    # Product CRUD
│   │   │   │   ├── orders/      # Order management
│   │   │   │   ├── users/       # User management
│   │   │   │   ├── coupons/     # Coupon management
│   │   │   │   ├── shipping/    # Shipping rules
│   │   │   │   ├── analytics/   # Advanced analytics
│   │   │   │   ├── invoices/    # Invoice management
│   │   │   │   ├── returns/     # Returns management
│   │   │   │   ├── subscriptions/ # Subscription management
│   │   │   │   ├── bank-verification/ # Bank verification
│   │   │   │   ├── payments/    # Payment tracking
│   │   │   │   └── tracking/    # Order tracking
│   │   │   ├── cart/            # Shopping cart
│   │   │   ├── checkout/        # Checkout process
│   │   │   ├── orders/          # User orders
│   │   │   ├── wishlist/        # Wishlist page
│   │   │   ├── subscriptions/  # User subscriptions
│   │   │   ├── returns/         # Returns & refunds
│   │   │   ├── invoices/        # User invoices
│   │   │   ├── coupons/        # Available coupons
│   │   │   ├── profile/        # User profile
│   │   │   ├── contact/        # Contact page
│   │   │   ├── about/          # About page
│   │   │   ├── faq/            # FAQ page
│   │   │   └── payment/        # Payment success/failure
│   │   ├── components/         # Reusable components
│   │   │   ├── Header.jsx      # Navigation header
│   │   │   ├── Footer.jsx      # Footer component
│   │   │   ├── AdminLayout.jsx # Admin layout wrapper
│   │   │   ├── TraditionalProcess.jsx # Traditional process showcase
│   │   │   ├── ImageCarousel.jsx # Product image carousel
│   │   │   ├── ProductCard.jsx # Product card component
│   │   │   ├── CartSummary.jsx # Cart summary
│   │   │   ├── WishlistButton.jsx # Wishlist functionality
│   │   │   ├── PaymentIntegration.jsx # Payment integration
│   │   │   ├── SubscriptionManager.jsx # Subscription management
│   │   │   ├── InvoiceManager.jsx # Invoice handling
│   │   │   ├── NotificationSystem.jsx # Notification system
│   │   │   ├── NotificationBell.jsx # Notification bell
│   │   │   ├── AddressSelector.jsx # Address selection
│   │   │   ├── RatingStars.jsx    # Rating display
│   │   │   ├── AnimationWrapper.jsx # Animation wrapper
│   │   │   ├── LoadingSpinner.jsx # Loading states
│   │   │   ├── AuthWrapper.jsx # Auth protection
│   │   │   ├── charts/         # Chart components
│   │   │   ├── profile/        # Profile components
│   │   │   └── ui/             # UI components
│   │   ├── contexts/           # React contexts
│   │   │   ├── AuthContext.jsx # Authentication state
│   │   │   ├── CartContext.jsx # Shopping cart state
│   │   │   └── WishlistContext.jsx # Wishlist state
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── useHydration.js # Hydration handler
│   │   │   └── useWebSocket.js # WebSocket connection
│   │   └── lib/                # Utilities
│   │       ├── api.js          # API client
│   │       └── utils.js        # Helper functions
│   ├── public/                 # Static assets
│   ├── package.json
│   └── next.config.mjs
│
├── server/                     # Express backend API
│   ├── app.js                  # Application entry point
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/            # Business logic
│   │   ├── authController.js   # Authentication
│   │   ├── userController.js   # User management
│   │   ├── productController.js # Product management
│   │   ├── cartController.js   # Shopping cart
│   │   ├── orderController.js  # Order management
│   │   ├── paymentController.js # Payment processing
│   │   ├── couponController.js # Coupons & discounts
│   │   ├── shippingController.js # Shipping rules
│   │   ├── invoiceController.js # Invoice generation
│   │   ├── subscriptionController.js # Subscriptions
│   │   ├── wishlistController.js # Wishlist
│   │   ├── notificationController.js # Notifications
│   │   ├── returnController.js # Returns & refunds
│   │   ├── adminController.js  # Admin operations
│   │   └── analyticsController.js # Analytics
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js             # User model
│   │   ├── Product.js          # Product model
│   │   ├── Order.js            # Order model
│   │   ├── Cart.js             # Cart model
│   │   ├── Coupon.js           # Coupon model
│   │   ├── ShippingRule.js     # Shipping rules
│   │   ├── Subscription.js     # Subscription model
│   │   ├── Wishlist.js         # Wishlist model
│   │   ├── Invoice.js          # Invoice model
│   │   ├── ReturnRequest.js    # Return requests
│   │   └── Notification.js     # Notifications
│   ├── routes/                 # API routes
│   │   ├── auth.js             # Auth routes
│   │   ├── users.js            # User routes
│   │   ├── products.js         # Product routes
│   │   ├── cart.js             # Cart routes
│   │   ├── orders.js           # Order routes
│   │   ├── payment.js          # Payment routes
│   │   ├── coupons.js          # Coupon routes
│   │   ├── shipping.js         # Shipping routes
│   │   ├── invoice.js          # Invoice routes
│   │   ├── subscriptions.js    # Subscription routes
│   │   ├── wishlist.js         # Wishlist routes
│   │   ├── notifications.js    # Notification routes
│   │   ├── returns.js          # Return routes
│   │   ├── admin.js            # Admin routes
│   │   └── analytics.js        # Analytics routes
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   └── errorHandler.js     # Error handling
│   ├── utils/                  # Utility functions
│   │   ├── seedData.js         # Database seeding
│   │   ├── shippingRulesData.js # Shipping data
│   │   ├── couponData.js       # Coupon data
│   │   ├── sendEmail.js        # Email service
│   │   ├── cloudinary.js        # File upload
│   │   ├── couponUtils.js      # Coupon utilities
│   │   ├── notificationService.js # Notification service
│   │   ├── websocket.js        # WebSocket server
│   │   └── errorHandler.js     # Error utilities
│   ├── tests/                  # Test files
│   ├── package.json
│   └── .env                    # Environment variables
│
└── README.md                   # This file
```

## 🎯 Core Features

### 🏠 Storefront Features

#### Homepage

- **Hero Section**: Animated carousel with product showcase
- **Traditional Process Section**: Interactive step-by-step ghee making process showcase
- **Featured Products**: Display of trending/popular products
- **Ghee Types Showcase**: Cow, Buffalo, A2, Organic, Mixed variants
- **Customer Testimonials**: Reviews and ratings
- **Stats Section**: Customer count, products, quality guarantees
- **Features Highlight**: Free shipping, quality guarantee, certifications

#### Product Catalog

- **Product Variants**:
  - Pure Cow Ghee
  - Buffalo Ghee
  - Mixed Ghee
  - Organic Ghee
  - A2 Ghee
- **Available Sizes**: 250g, 500g, 1kg, 2kg, 5kg
- **Product Features**:
  - Multiple images with carousel
  - Detailed descriptions
  - Nutritional information
  - SKU tracking
  - Stock management
  - Reviews and ratings
  - Discount pricing
  - Featured products
- **Filtering**: By type, size, price range
- **Search**: Product search functionality

### 🛒 Shopping Experience

#### Shopping Cart

- Add/remove items
- Quantity updates with stock validation
- Real-time price calculation
- Tax calculation (GST)
- Shipping cost calculation
- Coupon application
- Free shipping above ₹1000
- Cart persistence (user-specific)
- Empty cart states

#### Wishlist

- Add products to wishlist
- Wishlist page with product cards
- Quick add to cart from wishlist
- Remove items
- Wishlist count indicator
- Wishlist sync across devices

#### Checkout Process

- Address selection (multiple saved addresses)
- Set default address
- Shipping calculation by pincode
- Coupon code application
- Order summary
- Payment method selection
- Secure checkout flow

### 💳 Payment System

#### Payment Options

- **Razorpay Integration**: Credit/Debit cards, UPI, Net banking, Wallets
- **Cash on Delivery (COD)**: Available for select areas
- **Payment Verification**: Server-side signature verification
- **Payment Success/Failure**: Dedicated pages with order confirmation
- **Order Tracking**: Real-time order status updates

#### Payment Flow

1. User adds items to cart
2. Proceeds to checkout
3. Selects shipping address
4. Applies coupon (optional)
5. Reviews order summary
6. Creates Razorpay order
7. Completes payment
8. Payment verification on server
9. Order created and confirmed
10. Email notification sent
11. Invoice generated

### 📦 Order Management

#### Order Features

- **Order Creation**: Automatic after successful payment
- **Order Tracking**: Real-time status updates
  - Processing
  - Confirmed
  - Shipped
  - Out for Delivery
  - Delivered
  - Cancelled
- **Order Cancellation**: User-initiated with refund processing
- **Order History**: Complete order history with details
- **Order Details Page**: Comprehensive order information

#### Return & Refund System

- **Return Request**: Initiate return with reason
- **Return Reasons**:
  - Defective product
  - Wrong item received
  - Not as described
  - Damaged during shipping
  - Changed mind
  - Other
- **Return Workflow**:
  - Request submitted
  - Admin approval/rejection
  - Return shipment arranged
  - Product received back
  - Refund processed
  - Bank transfer verification
- **Refund Methods**: Razorpay, Bank Transfer, UPI, Cash
- **Return Window**: 7 days from delivery
- **Return Status Tracking**: Complete workflow tracking
- **Return Address Management**: Proper return logistics

### 🔄 Subscription System

#### Subscription Features

- **Recurring Orders**: Set up automatic recurring orders
- **Delivery Frequencies**:
  - Weekly
  - Bi-weekly
  - Monthly
  - Quarterly
- **Subscription Management**:
  - Create subscription
  - Pause subscription
  - Resume subscription
  - Cancel subscription
  - View subscription history
- **Next Delivery Date**: Automatic calculation
- **Delivery Limit**: Configurable delivery count limits
- **Subscription Address**: Dedicated delivery address
- **Discount Support**: Subscription-specific discounts
- **Notes**: Special delivery instructions

### 🎫 Coupon & Discount System

#### Coupon Types

- **Percentage Discount**: Percentage-based discounts
- **Fixed Discount**: Fixed amount discounts
- **First-Time Customer**: Exclusive for first orders
- **Bulk Discounts**: Higher discounts for larger orders
- **Loyalty Rewards**: Customer loyalty programs
- **Product-Specific**: Coupons for specific products

#### Coupon Features

- Usage limits (global and per-user)
- Minimum order amount
- Maximum discount cap
- Valid from/until dates
- User restrictions (specific users)
- Product/category restrictions
- Coupon validation
- Coupon history
- Usage tracking
- Admin management

### 🚚 Shipping Management

#### Shipping Features

- **Pincode-Based Shipping**: Calculate charges by pincode
- **Zone Management**: Different rates for different zones
- **Dynamic Charges**: Configurable shipping charges
- **Free Shipping**: Threshold-based free shipping
- **Estimated Delivery**: Delivery time estimates
- **Shipping Rules**: Flexible rule configuration
- **Admin Management**: Create/edit/delete shipping rules

### 📄 Invoice System

#### Invoice Features

- **GST-Compliant Invoices**: Proper tax calculation
- **PDF Generation**: Downloadable PDF invoices
- **Invoice Content**:
  - Seller information
  - Buyer information
  - Order details
  - Product list
  - Price breakdown
  - Tax details
  - Payment information
  - Order tracking
- **Invoice History**: Complete invoice records
- **Invoice Download**: PDF download functionality
- **Invoice Management**: Admin invoice management

### 💬 Notifications

#### Notification Types

- Order status updates
- Payment confirmations
- Shipment tracking
- Stock alerts
- Promotional offers
- Price drop alerts
- Return updates
- Subscription reminders

#### Notification Features

- Real-time notifications via WebSocket
- Notification bell with unread count
- Read/unread status
- Mark all as read
- Delete notifications
- Email notifications (optional)
- Notification history

### 👤 User Features

#### Authentication

- User registration (name, email, password, phone)
- Email verification
- Login with JWT
- Logout functionality
- Password reset with OTP
- Forgot password (OTP-based)
- Profile management
- Avatar upload

#### Profile Management

- Personal information
- Address book (multiple addresses)
- Default address setting
- Phone number management
- Password change
- Avatar upload
- Order history
- Wishlist access
- Subscription management
- Invoice access

#### Address Management

- Add multiple addresses
- Edit addresses
- Delete addresses
- Set default address
- Address validation
- Pincode verification
- Complete address details (name, phone, address, city, state, pincode)

### 🔐 Security Features

#### Security Implementation

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **CORS Protection**: Configured for allowed origins
- **Helmet**: Security headers
- **Input Validation**: express-validator
- **SQL Injection Prevention**: MongoDB + Mongoose
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based protection
- **Secure Cookies**: httpOnly, secure flags

### 📊 Admin Dashboard

#### Admin Features

- **Dashboard Overview**:
  - Total users, products, orders
  - Revenue statistics
  - Recent orders
  - Low stock alerts
  - Monthly statistics
- **Analytics Dashboard**:
  - Revenue trends (week/month/quarter/year)
  - Order status distribution
  - Top selling products
  - User growth charts
  - Product performance
  - Financial reports
  - Export analytics
- **Product Management**:
  - Create products
  - Edit products
  - Delete products
  - Upload images
  - Manage stock
  - Set featured products
  - Product reviews
- **Order Management**:
  - View all orders
  - Update order status
  - Process orders
  - Order details
  - Export orders
- **User Management**:
  - View all users
  - User details
  - Edit user information
  - Manage roles
  - User statistics
- **Coupon Management**:
  - Create coupons
  - Edit coupons
  - Delete coupons
  - View usage statistics
  - Coupon analytics
- **Shipping Management**:
  - Create shipping rules
  - Edit shipping rules
  - Delete shipping rules
  - Zone management
- **Returns Management**:
  - View return requests
  - Approve/reject returns
  - Update return status
  - Process refunds
  - Return analytics
- **Subscription Management**:
  - View all subscriptions
  - Update subscription status
  - Subscription analytics
- **Invoice Management**:
  - View all invoices
  - Download invoices
  - Invoice analytics
- **Payment Tracking**:
  - View payment transactions
  - Payment status
  - Payment history
  - Refund management
- **Bank Verification**:
  - User bank details management
  - Verify bank accounts
  - Bank transfer processing
- **Order Tracking**:
  - Track order shipments
  - Update tracking status
  - Tracking number management

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **Razorpay Account**: For payment processing
- **Gmail Account**: For sending emails
- **Cloudinary Account**: For media storage (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd single-product-ecommerce
   ```

2. **Install backend dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `server` directory:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/ghee-ecommerce
   # or
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Razorpay
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-secret-key

   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FROM_NAME=Pure Ghee Store
   FROM_EMAIL=your-email@gmail.com

   # Cloudinary (Optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. **Seed the database** (Optional)
   ```bash
   cd server
   npm run seed:all
   ```
   This will create:
   - Sample products
   - Admin user (email: admin@ghee-ecommerce.com, password: admin123456)
   - Shipping rules
   - Coupons

### Running the Application

**Start the backend server:**

```bash
cd server
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

The backend will run on `http://localhost:5000`

**Start the frontend application:**

```bash
cd client
npm run dev    # Development mode
# or
npm run build  # Build for production
npm start      # Production mode
```

The frontend will run on `http://localhost:3000`

## 🔌 API Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/me` - Get current user profile
- `PUT /auth/me/update` - Update profile
- `PUT /auth/password/update` - Update password
- `POST /auth/forgot-password` - Forgot password (send OTP)
- `PUT /auth/reset-password/:otp` - Reset password with OTP

### Product Endpoints

- `GET /products` - Get all products
- `GET /product/:id` - Get single product
- `GET /products/type/:type` - Get products by type
- `GET /products/size/:size` - Get products by size
- `GET /products/featured` - Get featured products
- `PUT /review` - Create product review
- `GET /reviews` - Get product reviews
- `DELETE /reviews` - Delete review
- `POST /admin/product/new` - Create product (Admin)
- `PUT /admin/product/:id` - Update product (Admin)
- `DELETE /admin/product/:id` - Delete product (Admin)

### Cart Endpoints

- `POST /cart/add` - Add item to cart
- `GET /cart` - Get user's cart
- `PUT /cart/update` - Update cart item
- `DELETE /cart/remove/:productId` - Remove item from cart
- `DELETE /cart/clear` - Clear cart
- `GET /cart/summary` - Get cart summary (with coupons)

### Order Endpoints

- `POST /order/new` - Create new order
- `GET /order/:id` - Get single order
- `GET /orders/me` - Get user's orders
- `PUT /order/:id/cancel` - Cancel order
- `GET /admin/orders` - Get all orders (Admin)
- `PUT /admin/order/:id` - Update order status (Admin)
- `DELETE /admin/order/:id` - Delete order (Admin)

### Payment Endpoints

- `POST /payment/create-order` - Create Razorpay order
- `POST /payment/verify` - Verify payment

### Coupon Endpoints

- `POST /coupon/validate` - Validate coupon code
- `GET /admin/coupons` - Get all coupons (Admin)
- `POST /admin/coupon/new` - Create coupon (Admin)
- `PUT /admin/coupon/:id` - Update coupon (Admin)
- `DELETE /admin/coupon/:id` - Delete coupon (Admin)

### Wishlist Endpoints

- `GET /wishlist` - Get user's wishlist
- `POST /wishlist/add` - Add product to wishlist
- `DELETE /wishlist/remove/:productId` - Remove from wishlist
- `DELETE /wishlist/clear` - Clear wishlist
- `GET /wishlist/check/:productId` - Check if product in wishlist

### Subscription Endpoints

- `POST /subscription/new` - Create subscription
- `GET /subscriptions` - Get user's subscriptions
- `PUT /subscription/:id` - Update subscription
- `PUT /subscription/:id/pause` - Pause subscription
- `PUT /subscription/:id/resume` - Resume subscription
- `PUT /subscription/:id/cancel` - Cancel subscription
- `GET /admin/subscriptions` - Get all subscriptions (Admin)

### Shipping Endpoints

- `POST /shipping/calculate` - Calculate shipping charges
- `GET /admin/shipping/rules` - Get shipping rules (Admin)
- `POST /admin/shipping/rule/new` - Create shipping rule (Admin)
- `PUT /admin/shipping/rule/:id` - Update shipping rule (Admin)
- `DELETE /admin/shipping/rule/:id` - Delete shipping rule (Admin)

### Invoice Endpoints

- `POST /invoice/generate/:orderId` - Generate invoice
- `GET /invoice/:id` - Get invoice details
- `GET /invoices/me` - Get user's invoices
- `GET /invoice/:id/pdf` - Download invoice PDF
- `GET /admin/invoices` - Get all invoices (Admin)

### Return Endpoints

- `POST /return/new` - Create return request
- `GET /returns` - Get user's return requests
- `GET /return/:id` - Get return details
- `PUT /return/:id/cancel` - Cancel return request
- `GET /admin/returns` - Get all returns (Admin)
- `PUT /admin/return/:id` - Update return status (Admin)

### Notification Endpoints

- `GET /notifications` - Get user's notifications
- `PUT /notification/:id/read` - Mark notification as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notification/:id` - Delete notification
- `GET /notifications/unread-count` - Get unread count

### Analytics Endpoints

- `GET /admin/dashboard` - Get dashboard statistics (Admin)
- `GET /analytics` - Get analytics data (Admin)
- `GET /analytics/revenue` - Get revenue trends (Admin)
- `GET /analytics/products` - Get product performance (Admin)
- `GET /analytics/export` - Export analytics (Admin)

### User Endpoints

- `GET /admin/users` - Get all users (Admin)
- `GET /admin/user/:id` - Get user details (Admin)
- `PUT /admin/user/:id` - Update user (Admin)
- `DELETE /admin/user/:id` - Delete user (Admin)
- `GET /admin/users/stats` - Get user statistics (Admin)

For detailed API documentation with request/response examples, see `server/README.md`.

## 🧪 Testing

The project includes comprehensive test suites for both frontend and backend.

### Backend Tests

```bash
cd server
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Test files:

- `tests/auth.test.js` - Authentication tests
- `tests/cart.test.js` - Cart tests
- `tests/orders.test.js` - Order tests
- `tests/products.test.js` - Product tests
- `tests/integration.test.js` - Integration tests

### Frontend Tests

```bash
cd client
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📝 Scripts

### Backend Scripts (server/package.json)

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run seed` - Seed products and admin user
- `npm run seed:shipping` - Seed shipping rules
- `npm run seed:coupons` - Seed coupons
- `npm run seed:all` - Seed all data

### Frontend Scripts (client/package.json)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## 🔧 Configuration

### MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `.env` file
3. Ensure MongoDB is running before starting the server

### Razorpay Setup

1. Create a Razorpay account at https://razorpay.com
2. Get your API keys from the dashboard
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
4. Configure webhook URLs if needed

### Email Setup (Gmail)

1. Enable "Less secure app access" or use App Password
2. Generate an App Password: Google Account > Security > App Passwords
3. Update `EMAIL_USER` and `EMAIL_PASS` in `.env`
4. Update `FROM_NAME` and `FROM_EMAIL` as needed

### Cloudinary Setup (Optional)

1. Create a Cloudinary account at https://cloudinary.com
2. Get your credentials from the dashboard
3. Update Cloudinary credentials in `.env`
4. Configure upload presets if needed

## 🎨 Special Features

### Traditional Process Showcase

The homepage features an interactive section showcasing the traditional ghee-making process with 5 detailed steps:

1. Milking with care
2. Heating milk and preparing curd
3. Wooden bilona churning
4. Slow cooking the butter
5. Filtering and packaging

This section includes:

- Animated step cards
- Detailed descriptions
- Image carousels
- Interactive navigation
- Process overview

### Bank Verification

Users can add and verify bank details for refund processing:

- Account holder name
- Account number
- IFSC code
- Bank name
- Branch name
- UPI ID
- Verification status

### Gift Options

Admin can configure gift options with custom messages and packaging.

### Vendor Support

The platform supports vendor/multi-seller functionality for future expansion.

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong JWT secrets** - Generate random secrets
3. **Enable HTTPS in production** - Use SSL certificates
4. **Rotate API keys regularly** - Update credentials periodically
5. **Implement rate limiting** - Prevent abuse
6. **Validate all inputs** - Prevent injection attacks
7. **Use prepared statements** - Mongoose handles this
8. **Keep dependencies updated** - Run `npm audit`
9. **Monitor logs** - Watch for suspicious activity
10. **Backup database regularly** - Ensure data safety

## 🚢 Deployment

### Backend Deployment

1. Set production environment variables
2. Build the application: `npm install`
3. Use PM2 for process management
4. Set up MongoDB Atlas
5. Configure domain and SSL
6. Set up monitoring and logging

### Frontend Deployment

1. Set production environment variables
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or custom server
4. Configure environment variables in hosting platform
5. Update API URLs
6. Enable caching and CDN

### Database Deployment

- Use MongoDB Atlas for cloud hosting
- Set up automated backups
- Configure replica sets
- Enable monitoring
- Set up alerts

## 📊 Monitoring & Analytics

### Built-in Analytics

- Dashboard statistics
- Revenue trends
- Order tracking
- User growth
- Product performance
- Financial reports
- Export capabilities

### Recommended Tools

- MongoDB Atlas monitoring
- Application logs
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contributing Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Write meaningful commit messages
- Ensure all tests pass
- Follow the existing architecture

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, questions, or feature requests:

- Open an issue in the repository
- Contact the development team
- Check the documentation

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Razorpay API](https://razorpay.com/docs)

---

**Built with ❤️ for premium ghee lovers**
