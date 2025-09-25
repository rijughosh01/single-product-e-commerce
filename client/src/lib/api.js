import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isInitialAuthCheck = false;

// Function to set initial auth check flag
export const setInitialAuthCheck = (value) => {
  isInitialAuthCheck = value;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error(
        "Network Error - Check if server is running on:",
        API_BASE_URL
      );

      if (error.config && !error.config._retry) {
        error.config._retry = true;
        console.log("Retrying network request...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return api.request(error.config);
      }
    }

    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (isInitialAuthCheck) {
        return Promise.reject(error);
      }
    }

    // Only log network errors
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error(
        "Network Error - Check if server is running on:",
        API_BASE_URL
      );
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/register", userData),
  login: (credentials) => api.post("/login", credentials),
  logout: () => api.post("/logout"),
  forgotPassword: (email) => api.post("/password/forgot", { email }),
  resetPassword: (email, otp, password) =>
    api.put("/password/reset", { email, otp, password }),
  verifyEmail: (token) => api.post(`/email/verify/${token}`),
  resendVerification: () => api.post("/email/resend-verification"),
  getProfile: () => api.get("/me"),
  updateProfile: (userData) => api.put("/me/update", userData),
  updatePassword: (passwords) => api.put("/password/update", passwords),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get("/products", { params }),
  getById: (id) => api.get(`/product/${id}`),
  getFeatured: () => api.get("/products/featured"),
  search: (query) => api.get(`/products/search?q=${query}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  getByType: (type) => api.get(`/products/type/${type}`),
  addReview: (reviewData) => api.put("/review", reviewData),
  getReviews: (productId) => api.get(`/reviews?id=${productId}`),
  deleteReview: (reviewId, productId) =>
    api.delete(`/reviews?id=${reviewId}&productId=${productId}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity = 1) =>
    api.post("/cart/add", { productId, quantity }),
  updateQuantity: (productId, quantity) =>
    api.put("/cart/update", { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete("/cart/clear"),

  getCartSummary: (couponCode = null, pincode = null) => {
    const params = new URLSearchParams();
    if (couponCode) params.append("couponCode", couponCode);
    if (pincode) params.append("pincode", pincode);
    const query = params.toString();
    return api.get(`/cart/summary${query ? `?${query}` : ""}`);
  },
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (productId) => api.post("/wishlist/add", { productId }),
  removeFromWishlist: (productId) =>
    api.delete(`/wishlist/remove/${productId}`),
  clearWishlist: () => api.delete("/wishlist/clear"),
  checkWishlistItem: (productId) => api.get(`/wishlist/check/${productId}`),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post("/order/new", orderData),
  getOrders: () => api.get("/orders/me"),
  getOrderById: (id) => api.get(`/order/${id}`),
  cancelOrder: (id) => api.put(`/order/${id}/cancel`),
  getOrderInvoice: (id) => api.get(`/order/${id}/invoice`),
  createPaymentOrder: (orderData) =>
    api.post("/payment/create-order", orderData),
  verifyPayment: (paymentData) => api.post("/payment/verify", paymentData),
};

// Payment API
export const paymentAPI = {
  createPaymentOrder: (orderData) =>
    api.post("/payment/create-order", orderData),
  createCODOrder: (orderData) =>
    api.post("/payment/create-cod-order", orderData),
  verifyPayment: (paymentData) => api.post("/payment/verify", paymentData),
  getPaymentDetails: (paymentId) => api.get(`/payment/${paymentId}`),
  refundPayment: (refundData) => api.post("/payment/refund", refundData),
  getAllPayments: (params = {}) => api.get("/admin/payments", { params }),
  getPaymentStats: (params = {}) =>
    api.get("/admin/payments/stats", { params }),
};

// Coupons API
export const couponsAPI = {
  validateCoupon: (data) => api.post("/coupon/validate", data),
  getCoupons: () => api.get("/admin/coupons"),
  getEligibleCoupons: (orderAmount = 0) =>
    api.get(`/coupons/eligible?orderAmount=${Number(orderAmount) || 0}`),
  getMyCouponUsage: () => api.get("/coupons/my-usage"),
  createCoupon: (couponData) => api.post("/admin/coupon/new", couponData),
  updateCoupon: (id, couponData) => api.put(`/admin/coupon/${id}`, couponData),
  deleteCoupon: (id) => api.delete(`/admin/coupon/${id}`),
  getCoupon: (id) => api.get(`/admin/coupon/${id}`),
  getCouponStats: () => api.get("/admin/coupons/stats"),
};

// Shipping API
export const shippingAPI = {
  getShippingRules: () => api.get("/admin/shipping/rules"),
  calculateShipping: (address) => api.post("/shipping/calculate", address),
  createShippingRule: (ruleData) =>
    api.post("/admin/shipping/rule/new", ruleData),
  updateShippingRule: (id, ruleData) =>
    api.put(`/admin/shipping/rule/${id}`, ruleData),
  deleteShippingRule: (id) => api.delete(`/admin/shipping/rule/${id}`),
  getShippingRule: (id) => api.get(`/admin/shipping/rule/${id}`),
  bulkCreateShippingRules: (rulesData) =>
    api.post("/admin/shipping/rules/bulk", rulesData),
  testPincode: (pincode) =>
    api.post("/admin/shipping/test-pincode", { pincode }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notification/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notification/${id}`),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  createNotification: (notificationData) =>
    api.post("/admin/notification/create", notificationData),
  getAllNotifications: () => api.get("/admin/notifications"),
};

// Subscriptions API
export const subscriptionsAPI = {
  createSubscription: (subscriptionData) =>
    api.post("/subscription/new", subscriptionData),
  getSubscriptions: () => api.get("/subscriptions"),
  getSubscription: (id) => api.get(`/subscription/${id}`),
  updateSubscription: (id, data) => api.put(`/subscription/${id}`, data),
  pauseSubscription: (id) => api.put(`/subscription/${id}/pause`),
  resumeSubscription: (id) => api.put(`/subscription/${id}/resume`),
  cancelSubscription: (id) => api.put(`/subscription/${id}/cancel`),
  getAllSubscriptions: () => api.get("/admin/subscriptions"),
  processDueSubscriptions: () => api.post("/admin/subscriptions/process"),
};

// Profile API
export const profileAPI = {
  getAddresses: () => api.get("/addresses"),
  addAddress: (addressData) => api.post("/address/add", addressData),
  updateAddress: (id, addressData) => api.put(`/address/${id}`, addressData),
  deleteAddress: (id) => api.delete(`/address/${id}`),
  setDefaultAddress: (id) => api.put(`/address/${id}/default`),
  updatePassword: (passwords) => api.put("/password/update", passwords),
};

// Invoice API
export const invoiceAPI = {
  generateInvoice: (orderId) => api.post(`/invoice/generate/${orderId}`),
  getInvoice: (id) => api.get(`/invoice/${id}`),
  getMyInvoices: () => api.get("/invoices/me"),
  downloadInvoicePDF: (id) =>
    api.get(`/invoice/${id}/pdf`, { responseType: "blob" }),
  getAllInvoices: () => api.get("/admin/invoices"),
  updateInvoice: (id, invoiceData) =>
    api.put(`/admin/invoice/${id}`, invoiceData),
  deleteInvoice: (id) => api.delete(`/admin/invoice/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard/stats"),

  // Products
  getAllProducts: (params = {}) => api.get("/admin/products", { params }),
  getProductById: (id) => api.get(`/admin/product/${id}`),
  createProduct: (productData) => api.post("/admin/product/new", productData),
  updateProduct: (id, productData) =>
    api.put(`/admin/product/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/product/${id}`),

  // Orders
  getAllOrders: (params = {}) => api.get("/admin/orders", { params }),
  getOrderById: (id) => api.get(`/admin/order/${id}`),
  updateOrder: (id, orderData) => api.put(`/admin/order/${id}`, orderData),
  deleteOrder: (id) => api.delete(`/admin/order/${id}`),
  getOrderStats: () => api.get("/admin/orders/stats"),

  // Users
  getAllUsers: (params = {}) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/user/${id}`),
  getUserDetails: (id) => api.get(`/admin/user/${id}`),
  updateUser: (id, userData) => api.put(`/admin/user/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
  getUserStats: () => api.get("/admin/users/stats"),

  // Analytics
  getAnalytics: (timeRange = "month") =>
    api.get(`/admin/analytics?range=${timeRange}`),
};

export default api;
