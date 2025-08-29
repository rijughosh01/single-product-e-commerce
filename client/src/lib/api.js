import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  forgotPassword: (email) => api.post('/password/forgot', { email }),
  resetPassword: (token, password) => api.post(`/password/reset/${token}`, { password }),
  verifyEmail: (token) => api.post(`/email/verify/${token}`),
  resendVerification: () => api.post('/email/resend-verification'),
  getProfile: () => api.get('/me'),
  updateProfile: (userData) => api.put('/me/update', userData),
  updatePassword: (passwords) => api.put('/password/update', passwords),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  search: (query) => api.get(`/products/search?q=${query}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  getByType: (type) => api.get(`/products/type/${type}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put(`/cart/update/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist/add', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/remove/${productId}`),
  clearWishlist: () => api.delete('/wishlist/clear'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getOrderInvoice: (id) => api.get(`/orders/${id}/invoice`),
};

// Coupons API
export const couponsAPI = {
  validateCoupon: (code) => api.post('/coupons/validate', { code }),
  getCoupons: () => api.get('/coupons'),
};

// Shipping API
export const shippingAPI = {
  getShippingRules: () => api.get('/shipping/rules'),
  calculateShipping: (address) => api.post('/shipping/calculate', address),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  createSubscription: (subscriptionData) => api.post('/subscriptions', subscriptionData),
  getSubscriptions: () => api.get('/subscriptions'),
  cancelSubscription: (id) => api.put(`/subscriptions/${id}/cancel`),
  updateSubscription: (id, data) => api.put(`/subscriptions/${id}`, data),
};

export default api;
