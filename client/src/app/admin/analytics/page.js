"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Target,
  Award,
  Clock,
  MapPin,
  CreditCard,
  Gift,
} from "lucide-react";
import RevenueChart from "@/components/charts/RevenueChart";
import OrderTrendsChart from "@/components/charts/OrderTrendsChart";
import ProductPerformanceChart from "@/components/charts/ProductPerformanceChart";
import PaymentMethodChart from "@/components/charts/PaymentMethodChart";
import GeographicChart from "@/components/charts/GeographicChart";
import TimeAnalysisChart from "@/components/charts/TimeAnalysisChart";
import { analyticsAPI } from "@/lib/api";

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [financialReports, setFinancialReports] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState(null);
  const [productPerformance, setProductPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedReportType, setSelectedReportType] = useState("comprehensive");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const [dashboardRes, financialRes, trendsRes, productRes] =
        await Promise.all([
          analyticsAPI.getDashboard({ period: selectedPeriod }),
          analyticsAPI.getFinancialReports({ reportType: selectedReportType }),
          analyticsAPI.getRevenueTrends({ period: selectedPeriod }),
          analyticsAPI.getProductPerformance({ limit: 10 }),
        ]);

      setDashboardData(dashboardRes.data?.data || null);
      setFinancialReports(financialRes.data?.data || null);
      setRevenueTrends(trendsRes.data?.data || null);
      setProductPerformance(productRes.data?.data || null);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <BarChart3 className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "financial", label: "Financial Reports", icon: DollarSign },
    { id: "products", label: "Product Performance", icon: Package },
    { id: "customers", label: "Customer Analytics", icon: Users },
    { id: "geographic", label: "Geographic Analysis", icon: MapPin },
    { id: "time", label: "Time Analysis", icon: Clock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where data is not loaded yet
  if (!dashboardData || !dashboardData.summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Loading Analytics...
            </h2>
            <p className="text-gray-600 mb-6">
              Fetching your business data and generating insights.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights into your business performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button
                onClick={fetchAnalyticsData}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
                onClick={async () => {
                  try {
                    const params = {
                      type:
                        activeTab === "overview"
                          ? "overview"
                          : activeTab === "financial"
                          ? "financial"
                          : activeTab === "products"
                          ? "products"
                          : "overview",
                      period: selectedPeriod,
                    };
                    const res = await analyticsAPI.export(params);
                    const blob = new Blob([res.data], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `analytics-${params.type}-${selectedPeriod}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (e) {
                    console.error("Export failed", e);
                    alert("Export failed. Please try again.");
                  }
                }}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === "overview" && dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          dashboardData.summary?.totalRevenue || 0
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getGrowthIcon(
                          dashboardData.summary?.revenueGrowth || 0
                        )}
                        <span
                          className={`text-sm ${getGrowthColor(
                            dashboardData.summary?.revenueGrowth || 0
                          )}`}
                        >
                          {Math.abs(
                            dashboardData.summary?.revenueGrowth || 0
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.summary?.totalOrders || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getGrowthIcon(dashboardData.summary?.orderGrowth || 0)}
                        <span
                          className={`text-sm ${getGrowthColor(
                            dashboardData.summary?.orderGrowth || 0
                          )}`}
                        >
                          {Math.abs(
                            dashboardData.summary?.orderGrowth || 0
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        New Customers
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(
                          dashboardData.summary?.totalCustomers || 0
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getGrowthIcon(
                          dashboardData.summary?.customerGrowth || 0
                        )}
                        <span
                          className={`text-sm ${getGrowthColor(
                            dashboardData.summary?.customerGrowth || 0
                          )}`}
                        >
                          {Math.abs(
                            dashboardData.summary?.customerGrowth || 0
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          dashboardData.summary?.averageOrderValue || 0
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Target className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-600">
                          Target: ₹500
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-full">
                      <Award className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueTrends?.trends || []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTrendsChart data={revenueTrends?.trends || []} />
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductPerformanceChart
                  data={productPerformance?.products || []}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Financial Reports Tab */}
        {activeTab === "financial" && financialReports && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Revenue Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Gross Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          financialReports.revenueAnalysis.grossRevenue
                        )}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Net Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          financialReports.revenueAnalysis.netRevenue
                        )}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Refunded
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          financialReports.revenueAnalysis.refundedAmount
                        )}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tax Collected
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          financialReports.revenueAnalysis.taxCollected
                        )}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentMethodChart data={financialReports.paymentAnalysis} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Coupon Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Coupons Used
                      </span>
                      <span className="font-semibold">
                        {formatNumber(
                          financialReports.couponAnalysis.totalCouponsUsed
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Discount Given
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(
                          financialReports.couponAnalysis.totalDiscountGiven
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Average Discount
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(
                          financialReports.couponAnalysis
                            .averageDiscountPerOrder
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Effectiveness
                      </span>
                      <Badge variant="secondary">
                        {financialReports.couponAnalysis.couponEffectiveness.toFixed(
                          1
                        )}
                        %
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Product Performance Tab */}
        {activeTab === "products" && productPerformance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductPerformanceChart
                  data={productPerformance?.products || []}
                  detailed={true}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Customer Analytics Tab */}
        {activeTab === "customers" && financialReports && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Customers
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(
                          financialReports.customerAnalysis.totalCustomers
                        )}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        New Customers
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(
                          financialReports.customerAnalysis.newCustomers
                        )}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Repeat Customers
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(
                          financialReports.customerAnalysis.repeatCustomers
                        )}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          financialReports.customerAnalysis.averageOrderValue
                        )}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Geographic Analysis Tab */}
        {activeTab === "geographic" && financialReports && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Geographic Sales Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GeographicChart data={financialReports.geographicAnalysis} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Time Analysis Tab */}
        {activeTab === "time" && financialReports && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time-based Sales Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TimeAnalysisChart data={financialReports.timeAnalysis} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
