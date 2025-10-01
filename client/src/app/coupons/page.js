"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tag,
  Calendar,
  DollarSign,
  Percent,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Gift,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Package,
  Star,
} from "lucide-react";
import { couponsAPI } from "@/lib/api";
import { toast } from "sonner";

export default function CouponsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [couponData, setCouponData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchCouponUsage();
  }, [isAuthenticated, router]);

  const fetchCouponUsage = async () => {
    setLoading(true);
    try {
      const response = await couponsAPI.getMyCouponUsage();
      setCouponData(response.data);
    } catch (error) {
      console.error("Error fetching coupon usage:", error);
      toast.error("Failed to load coupon information");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const renderSkeletons = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-lg"
        >
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="mb-4">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="flex gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-16 w-16 bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-lg text-gray-600">
              Loading coupon information...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const filteredCoupons =
    couponData?.usedCoupons?.filter((coupon) => {
      const matchesSearch =
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "used" && coupon.usageCount > 0) ||
        (statusFilter === "available" && coupon.remainingUses > 0);

      return matchesSearch && matchesStatus;
    }) || [];

  const filteredAvailableCoupons =
    couponData?.availableCoupons?.filter((coupon) => {
      const matchesSearch =
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && coupon.canUse) ||
        (statusFilter === "used" && !coupon.canUse);

      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(250,204,21,0.08),transparent_40%)]" />
            <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-2">
                  My Coupons
                </h1>
                <p className="text-lg text-gray-600">
                  Track your coupon usage and available discounts
                </p>
              </div>
              {couponData?.summary && (
                <div className="grid grid-cols-3 divide-x rounded-xl border border-orange-100 bg-gradient-to-r from-white to-orange-50 shadow-lg overflow-hidden">
                  <div className="p-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Total Coupons Used
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {couponData.summary.totalCouponsUsed}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Total Discount
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(couponData.summary.totalDiscountReceived)}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Orders with Coupons
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {couponData.summary.totalOrdersWithCoupons}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search coupons by code or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-orange-200 rounded-xl bg-white/80 shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-orange-200 rounded-xl bg-white/80 shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Coupons</option>
                <option value="used">Used</option>
                <option value="available">Available</option>
              </select>
              <Button
                variant="outline"
                onClick={fetchCouponUsage}
                disabled={loading}
                className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300 rounded-xl"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["all", "used", "available"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 hover:shadow-md ${
                  statusFilter === s
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-lg"
                    : "bg-white text-gray-700 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                }`}
              >
                {s === "all" ? "All" : s === "used" ? "Used" : "Available"}
              </button>
            ))}
          </div>
        </div>

        {/* Coupons List */}
        {loading ? (
          renderSkeletons()
        ) : (
          <div className="space-y-6">
            {/* Used Coupons Section */}
            {filteredCoupons.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Used Coupons
                  </h2>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {filteredCoupons.length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {filteredCoupons.map((coupon, index) => (
                    <Card
                      key={index}
                      className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-0">
                        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                                    {coupon.code}
                                  </h3>
                                  <p className="text-base text-gray-600 font-medium">
                                    Used {coupon.usageCount} time
                                    {coupon.usageCount > 1 ? "s" : ""}
                                  </p>
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                                  Used
                                </Badge>
                              </div>

                              {coupon.description && (
                                <p className="text-sm text-gray-600 mb-4">
                                  {coupon.description}
                                </p>
                              )}

                              <div className="flex items-center gap-6 text-base text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-5 h-5 text-green-500" />
                                  <span className="font-medium">
                                    {formatPrice(coupon.totalDiscount)} saved
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-green-500" />
                                  <span className="font-medium">
                                    Last used: {formatDate(coupon.lastUsed)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>
                                  Limit: {coupon.maxUsagePerUser || 1}
                                </span>
                                <span>Remaining: {coupon.remainingUses}</span>
                                {coupon.isFirstTimeOnly && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-orange-600 border-orange-300"
                                  >
                                    First-time only
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Available Coupons Section */}
            {filteredAvailableCoupons.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Coupons
                  </h2>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {filteredAvailableCoupons.length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {filteredAvailableCoupons.map((coupon, index) => (
                    <Card
                      key={index}
                      className={`group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 rounded-2xl shadow-lg backdrop-blur-sm hover:-translate-y-1 ${
                        coupon.canUse ? "bg-white/80" : "bg-gray-50/80"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-0">
                        <div
                          className={`h-1 w-full ${
                            coupon.canUse
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                              : "bg-gradient-to-r from-gray-400 to-gray-500"
                          }`}
                        />
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                    {coupon.code}
                                  </h3>
                                  <p className="text-base text-gray-600 font-medium">
                                    {coupon.canUse ? "Available" : "Used up"}
                                  </p>
                                </div>
                                <Badge
                                  className={`${
                                    coupon.canUse
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                                  } px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm`}
                                >
                                  {coupon.canUse ? "Available" : "Used up"}
                                </Badge>
                              </div>

                              {coupon.description && (
                                <p className="text-sm text-gray-600 mb-4">
                                  {coupon.description}
                                </p>
                              )}

                              <div className="flex items-center gap-6 text-base text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium">
                                    {coupon.discountType === "percentage"
                                      ? `${coupon.discountValue}% off`
                                      : `${formatPrice(
                                          coupon.discountValue
                                        )} off`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium">
                                    Expires: {formatDate(coupon.validUntil)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>
                                  Min order:{" "}
                                  {formatPrice(coupon.minimumOrderAmount)}
                                </span>
                                <span>
                                  Used: {coupon.userUsage}/
                                  {coupon.maxUsagePerUser}
                                </span>
                                {coupon.remainingUses > 0 && (
                                  <span className="text-green-600 font-medium">
                                    {coupon.remainingUses} remaining
                                  </span>
                                )}
                                {coupon.maximumDiscount > 0 && (
                                  <span>
                                    Max: {formatPrice(coupon.maximumDiscount)}
                                  </span>
                                )}
                              </div>

                              {coupon.isFirstTimeOnly && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-2 text-orange-600 border-orange-300"
                                >
                                  First-time customers only
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredCoupons.length === 0 &&
              filteredAvailableCoupons.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Gift className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "No coupons match your search"
                      : "No coupons found"}
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search criteria or filters."
                      : "You don't have any coupons yet. Check back later for new offers!"}
                  </p>
                  {(searchQuery || statusFilter !== "all") && (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
          </div>
        )}

        {!loading &&
          (filteredCoupons.length > 0 ||
            filteredAvailableCoupons.length > 0) && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Showing{" "}
                {filteredCoupons.length + filteredAvailableCoupons.length}{" "}
                coupons
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
