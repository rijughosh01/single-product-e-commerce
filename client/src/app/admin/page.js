"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  UserCheck,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  Star,
  ShoppingBag,
  CreditCard,
  Truck,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      const data = response.data.data;

      console.log("Dashboard stats received:", data);
      console.log("Recent orders:", data.recentOrders);

      setStats({
        totalProducts: data.totalProducts,
        totalUsers: data.totalUsers,
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
        recentOrders: data.recentOrders || [],
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "Shipped":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Processing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const quickActions = [
    {
      title: "Add Product",
      description: "Create new product listing",
      icon: Plus,
      href: "/admin/products/new",
      color: "bg-blue-500 hover:bg-blue-600",
      iconColor: "text-blue-500",
    },
    {
      title: "View Orders",
      description: "Manage customer orders",
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "bg-green-500 hover:bg-green-600",
      iconColor: "text-green-500",
    },
    {
      title: "Manage Users",
      description: "Customer management",
      icon: UserCheck,
      href: "/admin/users",
      color: "bg-purple-500 hover:bg-purple-600",
      iconColor: "text-purple-500",
    },
    {
      title: "Analytics",
      description: "Business insights",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-orange-500 hover:bg-orange-600",
      iconColor: "text-orange-500",
    },
  ];

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      iconColor: "text-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-green-500",
      iconColor: "text-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-purple-500",
      iconColor: "text-purple-500",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-yellow-500",
      iconColor: "text-yellow-500",
      change: "+23%",
      changeType: "positive",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
              <p className="text-blue-100 text-lg">
                Here&apos;s what&apos;s happening with your store today.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <div className="text-blue-100 text-sm">Orders Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="text-blue-100 text-sm">Revenue Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {card.changeType === "positive" ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    card.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {card.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </p>
              <p className="text-sm text-gray-500">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-500">Common admin tasks</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.href)}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left"
            >
              <div
                className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500">Latest customer orders</p>
          </div>
          <button
            onClick={() => router.push("/admin/orders")}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <span>View all orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {stats.recentOrders &&
              Array.isArray(stats.recentOrders) &&
              stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order?.id ? order.id.slice(-8) : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
                            {order?.customer?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order?.customer || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">Customer</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order?.amount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          order?.status || "Unknown"
                        )}`}
                      >
                        {order?.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order?.date
                        ? new Date(order.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No orders yet</p>
                      <p className="text-sm">
                        Orders will appear here once customers start placing
                        them.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
