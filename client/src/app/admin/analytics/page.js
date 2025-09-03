'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Package,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { RevenueChart, OrderStatusChart, TopProductsChart, UserGrowthChart } from '@/components/charts/AnalyticsCharts';

export default function AdminAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 45600,
      monthly: 12300,
      weekly: 3200,
      daily: 450,
      growth: 12.5
    },
    orders: {
      total: 89,
      monthly: 23,
      weekly: 6,
      daily: 1,
      growth: 8.2
    },
    users: {
      total: 156,
      monthly: 12,
      weekly: 3,
      daily: 0,
      growth: 15.7
    },
    products: {
      total: 12,
      active: 10,
      featured: 3,
      outOfStock: 2
    },
    topProducts: [
      { name: 'Pure Cow Ghee 500g', sales: 45, revenue: 20250 },
      { name: 'Buffalo Ghee 1kg', sales: 32, revenue: 27200 },
      { name: 'Organic Ghee 250g', sales: 28, revenue: 7840 },
      { name: 'A2 Ghee 1kg', sales: 25, revenue: 15000 },
      { name: 'Mixed Ghee 500g', sales: 20, revenue: 9000 }
    ],
    recentActivity: [
      { type: 'order', message: 'New order #1234 placed by John Doe', time: '2 hours ago' },
      { type: 'user', message: 'New user registration: jane@example.com', time: '4 hours ago' },
      { type: 'product', message: 'Product "Organic Ghee" stock updated', time: '6 hours ago' },
      { type: 'order', message: 'Order #1233 delivered successfully', time: '1 day ago' },
      { type: 'user', message: 'User verification completed: bob@example.com', time: '1 day ago' }
    ],
    // Chart data
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [12000, 19000, 15000, 25000, 22000, 30000]
    },
    orderStatusChart: {
      labels: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      values: [15, 25, 30, 20, 10]
    },
    topProductsChart: {
      labels: ['Cow Ghee', 'Buffalo Ghee', 'Organic Ghee', 'A2 Ghee', 'Mixed Ghee'],
      values: [45, 32, 28, 25, 20]
    },
    userGrowthChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [12, 19, 15, 25, 22, 30]
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
      return;
    }

    fetchAnalytics();
  }, [isAuthenticated, user, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics(timeRange);
      const data = response.data.data;
      
      setAnalytics({
        revenue: {
          total: data.totalRevenue || 0,
          monthly: data.totalRevenue || 0,
          weekly: data.totalRevenue || 0,
          daily: data.totalRevenue || 0,
          growth: 12.5 // This would need to be calculated from historical data
        },
        orders: {
          total: data.totalOrders || 0,
          monthly: data.totalOrders || 0,
          weekly: data.totalOrders || 0,
          daily: data.totalOrders || 0,
          growth: 8.2 // This would need to be calculated from historical data
        },
        users: {
          total: 156, // This would come from user stats
          monthly: 12,
          weekly: 3,
          daily: 0,
          growth: 15.7
        },
        products: {
          total: 12,
          active: 10,
          featured: 3,
          outOfStock: 2
        },
        topProducts: data.topProducts || [],
        recentActivity: [
          { type: 'order', message: 'New order #1234 placed by John Doe', time: '2 hours ago' },
          { type: 'user', message: 'New user registration: jane@example.com', time: '4 hours ago' },
          { type: 'product', message: 'Product "Organic Ghee" stock updated', time: '6 hours ago' },
          { type: 'order', message: 'Order #1233 delivered successfully', time: '1 day ago' },
          { type: 'user', message: 'User verification completed: bob@example.com', time: '1 day ago' }
        ],
        // Chart data from API
        revenueChart: data.revenueChart || {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          values: [12000, 19000, 15000, 25000, 22000, 30000]
        },
        orderStatusChart: data.orderStatusChart || {
          labels: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
          values: [15, 25, 30, 20, 10]
        },
        topProductsChart: data.topProductsChart || {
          labels: ['Cow Ghee', 'Buffalo Ghee', 'Organic Ghee', 'A2 Ghee', 'Mixed Ghee'],
          values: [45, 32, 28, 25, 20]
        },
        userGrowthChart: data.userGrowthChart || {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          values: [12, 19, 15, 25, 22, 30]
        }
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Business insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 3 months</option>
                <option value="year">Last year</option>
              </select>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{analytics.revenue.total.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analytics.revenue.growth)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.revenue.growth)}`}>
                    {analytics.revenue.growth > 0 ? '+' : ''}{analytics.revenue.growth}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.orders.total}</p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analytics.orders.growth)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.orders.growth)}`}>
                    {analytics.orders.growth > 0 ? '+' : ''}{analytics.orders.growth}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.users.total}</p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analytics.users.growth)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.users.growth)}`}>
                    {analytics.users.growth > 0 ? '+' : ''}{analytics.users.growth}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.products.active}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {analytics.products.featured} featured, {analytics.products.outOfStock} out of stock
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Selling Products</h2>
              <Link
                href="/admin/products"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'user' ? 'bg-green-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Trend</h2>
            <RevenueChart data={analytics.revenueChart} timeRange={timeRange} />
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status Distribution</h2>
            <OrderStatusChart data={analytics.orderStatusChart} />
          </div>
        </div>

        {/* Additional Charts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Selling Products</h2>
            <TopProductsChart data={analytics.topProductsChart} />
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Growth</h2>
            <UserGrowthChart data={analytics.userGrowthChart} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/products/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Add New Product</p>
                <p className="text-xs text-gray-500">Create a new product listing</p>
              </div>
            </Link>
            
            <Link
              href="/admin/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Orders</p>
                <p className="text-xs text-gray-500">View and update order status</p>
              </div>
            </Link>
            
            <Link
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">User Management</p>
                <p className="text-xs text-gray-500">Manage user accounts</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
