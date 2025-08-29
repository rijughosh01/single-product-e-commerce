# Ghee E-commerce Backend API

A comprehensive backend API for a single-product e-commerce website specializing in ghee products. Built with Node.js, Express, MongoDB, and integrated with Razorpay for payments.

## Features

### 🔐 Authentication & User Management
- User registration and login with JWT
- Password reset functionality
- Profile management
- Role-based access control (User/Admin)

### 🛍️ Product Management
- Multiple ghee variants (Cow, Buffalo, A2, Organic, Mixed)
- Different sizes (250g, 500g, 1kg, 2kg, 5kg)
- Product reviews and ratings
- Stock management
- Featured products

### 🛒 Shopping Cart
- Add/remove items from cart
- Update quantities
- Cart summary with tax calculation
- Free shipping above ₹500

### 💳 Order Management
- Complete order lifecycle
- Order tracking
- Order cancellation
- Email notifications
- GST-compliant invoice generation
- PDF invoice download

### 💰 Payment Integration
- Razorpay payment gateway
- Payment verification
- Order confirmation

### 📍 Address Management
- Multiple delivery addresses
- Default address setting
- Address validation

### 🚚 Shipping Management
- Pincode-based shipping rules
- Dynamic shipping charges
- Free shipping thresholds
- Estimated delivery dates
- Zone-based shipping

### 🎫 Coupon & Discount System
- Multiple coupon types (percentage/fixed)
- Usage limits and restrictions
- First-time user discounts
- Bulk order discounts
- Loyalty rewards

### ❤️ Wishlist Management
- Add/remove products to wishlist
- Wishlist synchronization
- Product availability tracking

### 🔔 Notification System
- Real-time notifications
- Order status updates
- Stock alerts
- Promotional notifications
- Email integration

### 🔄 Subscription Management
- Recurring orders
- Flexible delivery schedules
- Pause/resume subscriptions
- Automatic order processing

### 📊 Admin Panel
- Product management
- Order management
- User management
- Sales statistics
- Order status updates

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Security**: Helmet, Rate Limiting, CORS
- **Validation**: Express Validator

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Razorpay account
- Gmail account (for email notifications)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/ghee-ecommerce

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Razorpay Configuration
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-secret-key

   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env` file

5. **Seed Database**
   ```bash
   npm run seed:all
   ```
   This will create sample products, admin user, shipping rules, and coupons.

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/register` - Register new user
- `POST /api/v1/login` - User login
- `GET /api/v1/logout` - User logout
- `POST /api/v1/password/forgot` - Forgot password
- `PUT /api/v1/password/reset/:token` - Reset password
- `GET /api/v1/me` - Get user profile
- `PUT /api/v1/me/update` - Update profile
- `PUT /api/v1/password/update` - Update password

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/product/:id` - Get single product
- `GET /api/v1/products/type/:type` - Get products by type
- `GET /api/v1/products/size/:size` - Get products by size
- `GET /api/v1/products/featured` - Get featured products
- `PUT /api/v1/review` - Create product review
- `GET /api/v1/reviews` - Get product reviews
- `DELETE /api/v1/reviews` - Delete review

### Cart
- `POST /api/v1/cart/add` - Add item to cart
- `GET /api/v1/cart` - Get user's cart
- `PUT /api/v1/cart/update` - Update cart item
- `DELETE /api/v1/cart/remove/:productId` - Remove item from cart
- `DELETE /api/v1/cart/clear` - Clear cart
- `GET /api/v1/cart/summary` - Get cart summary (supports coupon codes)

### Coupons
- `POST /api/v1/coupon/validate` - Validate coupon code
- `GET /api/v1/admin/coupons` - Get all coupons (Admin)
- `POST /api/v1/admin/coupon/new` - Create coupon (Admin)
- `PUT /api/v1/admin/coupon/:id` - Update coupon (Admin)
- `DELETE /api/v1/admin/coupon/:id` - Delete coupon (Admin)

### Wishlist
- `GET /api/v1/wishlist` - Get user's wishlist
- `POST /api/v1/wishlist/add` - Add product to wishlist
- `DELETE /api/v1/wishlist/remove/:productId` - Remove from wishlist
- `DELETE /api/v1/wishlist/clear` - Clear wishlist
- `GET /api/v1/wishlist/check/:productId` - Check if product in wishlist

### Notifications
- `GET /api/v1/notifications` - Get user's notifications
- `PUT /api/v1/notification/:id/read` - Mark notification as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notification/:id` - Delete notification
- `GET /api/v1/notifications/unread-count` - Get unread count

### Subscriptions
- `POST /api/v1/subscription/new` - Create subscription
- `GET /api/v1/subscriptions` - Get user's subscriptions
- `PUT /api/v1/subscription/:id` - Update subscription
- `PUT /api/v1/subscription/:id/pause` - Pause subscription
- `PUT /api/v1/subscription/:id/resume` - Resume subscription
- `PUT /api/v1/subscription/:id/cancel` - Cancel subscription

### Orders
- `POST /api/v1/order/new` - Create new order
- `GET /api/v1/order/:id` - Get single order
- `GET /api/v1/orders/me` - Get user's orders
- `PUT /api/v1/order/:id/cancel` - Cancel order

### Shipping
- `POST /api/v1/shipping/calculate` - Calculate shipping charges
- `GET /api/v1/admin/shipping/rules` - Get shipping rules (Admin)
- `POST /api/v1/admin/shipping/rule/new` - Create shipping rule (Admin)
- `PUT /api/v1/admin/shipping/rule/:id` - Update shipping rule (Admin)
- `DELETE /api/v1/admin/shipping/rule/:id` - Delete shipping rule (Admin)

### Invoice
- `POST /api/v1/invoice/generate/:orderId` - Generate invoice
- `GET /api/v1/invoice/:id` - Get invoice details
- `GET /api/v1/invoices/me` - Get user's invoices
- `GET /api/v1/invoice/:id/pdf` - Download invoice PDF

### Payment
- `POST /api/v1/payment/create-order` - Create Razorpay order
- `POST /api/v1/payment/verify` - Verify payment

### Address Management
- `POST /api/v1/address/add` - Add new address
- `GET /api/v1/addresses` - Get user addresses
- `PUT /api/v1/address/:id` - Update address
- `DELETE /api/v1/address/:id` - Delete address
- `PUT /api/v1/address/:id/default` - Set default address

### Admin Routes
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/user/:id` - Get user details
- `PUT /api/v1/admin/user/:id` - Update user
- `DELETE /api/v1/admin/user/:id` - Delete user
- `GET /api/v1/admin/users/stats` - Get user statistics
- `POST /api/v1/admin/product/new` - Create new product
- `PUT /api/v1/admin/product/:id` - Update product
- `DELETE /api/v1/admin/product/:id` - Delete product
- `GET /api/v1/admin/orders` - Get all orders
- `PUT /api/v1/admin/order/:id` - Update order status
- `DELETE /api/v1/admin/order/:id` - Delete order
- `GET /api/v1/admin/orders/stats` - Get order statistics

## Sample API Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl -X GET http://localhost:5000/api/v1/products
```

### Add to Cart
```bash
curl -X POST http://localhost:5000/api/v1/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 2
  }'
```

### Calculate Shipping
```bash
curl -X POST http://localhost:5000/api/v1/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "pincode": "400001",
    "orderAmount": 500
  }'
```

### Generate Invoice
```bash
curl -X POST http://localhost:5000/api/v1/invoice/generate/ORDER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Download Invoice PDF
```bash
curl -X GET http://localhost:5000/api/v1/invoice/INVOICE_ID/pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output invoice.pdf
```

## Database Schema

### User Schema
- Basic info (name, email, password, phone)
- Addresses array with multiple addresses
- Role (user/admin)
- Email verification status

### Product Schema
- Product details (name, description, price)
- Variants (type, size)
- Stock management
- Reviews and ratings
- Nutritional information

### Order Schema
- Order items with quantities
- Shipping information
- Payment details
- Order status tracking
- Delivery tracking

### Cart Schema
- User reference
- Items array with products and quantities
- Total calculations

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention (MongoDB)

## Email Notifications

The system sends email notifications for:
- Order confirmation
- Order status updates
- Password reset
- Welcome emails

## Payment Flow

1. User adds items to cart
2. Proceeds to checkout
3. Creates Razorpay order
4. Completes payment
5. Payment verification
6. Order creation
7. Email confirmation

## Admin Features

- **Product Management**: Add, edit, delete products
- **Order Management**: View all orders, update status
- **User Management**: View user details, manage roles
- **Analytics**: Sales statistics, user statistics
- **Inventory**: Stock management

## Environment Variables

Make sure to set up all required environment variables in your `.env` file:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `RAZORPAY_KEY_ID`: Razorpay public key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key
- `EMAIL_USER`: Gmail address
- `EMAIL_PASS`: Gmail app password

## Deployment

1. Set up environment variables for production
2. Use PM2 or similar process manager
3. Set up MongoDB Atlas for database
4. Configure domain and SSL
5. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
