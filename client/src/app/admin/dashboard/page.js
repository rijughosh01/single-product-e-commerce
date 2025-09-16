"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { adminAPI, paymentAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [paymentStats, setPaymentStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, paymentResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        paymentAPI.getPaymentStats(),
      ]);

      console.log("Dashboard API Response:", dashboardResponse.data);
      console.log("Recent Orders:", dashboardResponse.data?.data?.recentOrders);

      setDashboardData(dashboardResponse.data?.data || {});
      setPaymentStats(paymentResponse.data.stats || {});
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Overview of your e-commerce platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      dashboardData.totalRevenue || paymentStats.totalAmount
                    )}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +12% from last month
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(dashboardData.totalOrders)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    +8% from last month
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(dashboardData.totalUsers)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    +15% from last month
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* Payment Success Rate */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Payment Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paymentStats.totalPayments > 0
                      ? Math.round(
                          ((paymentStats.successfulPayments || 0) /
                            paymentStats.totalPayments) *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {formatNumber(paymentStats.successfulPayments || 0)}{" "}
                    successful
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Methods Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(paymentStats.methodBreakdown || {}).map(
                  ([method, count]) => (
                    <div
                      key={method}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium capitalize">
                          {method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <Badge variant="outline">
                          {paymentStats.totalPayments > 0
                            ? Math.round(
                                (count / paymentStats.totalPayments) * 100
                              )
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Successful</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formatNumber(paymentStats.successfulPayments || 0)}
                    </span>
                    <Badge variant="default">Success</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Failed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formatNumber(paymentStats.failedPayments || 0)}
                    </span>
                    <Badge variant="destructive">Failed</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formatNumber(paymentStats.pendingPayments || 0)}
                    </span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Refunded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formatNumber(paymentStats.refundedPayments || 0)}
                    </span>
                    <Badge variant="outline">Refunded</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders?.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {order.customer || "Unknown User"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(order.amount)}
                    </p>
                    <Badge
                      variant={
                        order.status === "Delivered"
                          ? "default"
                          : order.status === "Processing"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Manage Products</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add, edit, or remove products from your store
              </p>
              <Button
                onClick={() => (window.location.href = "/admin/products")}
                className="w-full"
              >
                Manage Products
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">View Orders</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track and manage customer orders
              </p>
              <Button
                onClick={() => (window.location.href = "/admin/orders")}
                variant="outline"
                className="w-full"
              >
                View Orders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CreditCard className="w-8 h-8 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Payment Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Detailed payment statistics and insights
              </p>
              <Button
                onClick={() => (window.location.href = "/admin/payments")}
                variant="outline"
                className="w-full"
              >
                View Payments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
