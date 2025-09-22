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
} from "lucide-react";
import { couponsAPI } from "@/lib/api";
import { toast } from "sonner";

export default function CouponsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [couponData, setCouponData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Coupons</h1>
          <p className="text-gray-600">
            Track your coupon usage and available discounts
          </p>
        </div>

        {/* Summary Cards */}
        {couponData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">
                      Total Coupons Used
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {couponData.summary.totalCouponsUsed}
                    </p>
                  </div>
                  <Gift className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Total Discount Received
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatPrice(couponData.summary.totalDiscountReceived)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">
                      Orders with Coupons
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {couponData.summary.totalOrdersWithCoupons}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Used Coupons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                Used Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {couponData?.usedCoupons && couponData.usedCoupons.length > 0 ? (
                <div className="space-y-4">
                  {couponData.usedCoupons.map((coupon, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 text-white">
                            {coupon.code}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Used {coupon.usageCount} time
                            {coupon.usageCount > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {formatPrice(coupon.totalDiscount)} saved
                          </p>
                          <p className="text-xs text-gray-500">
                            Last used: {formatDate(coupon.lastUsed)}
                          </p>
                        </div>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {coupon.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Limit: {coupon.maxUsagePerUser || 1}</span>
                        <span>Remaining: {coupon.remainingUses}</span>
                        {coupon.isFirstTimeOnly && (
                          <Badge variant="outline" className="text-xs">
                            First-time only
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No coupons used yet</p>
                  <p className="text-sm text-gray-400">
                    Start shopping to use coupons and save money!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Coupons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-600" />
                Available Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {couponData?.availableCoupons &&
              couponData.availableCoupons.length > 0 ? (
                <div className="space-y-4">
                  {couponData.availableCoupons.map((coupon, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        coupon.canUse
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${
                              coupon.canUse ? "bg-green-500" : "bg-gray-400"
                            } text-white`}
                          >
                            {coupon.code}
                          </Badge>
                          {coupon.canUse ? (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-300"
                            >
                              Available
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-gray-500 border-gray-300"
                            >
                              Used up
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}% off`
                              : `${formatPrice(coupon.discountValue)} off`}
                          </p>
                          {coupon.maximumDiscount > 0 && (
                            <p className="text-xs text-gray-500">
                              Max: {formatPrice(coupon.maximumDiscount)}
                            </p>
                          )}
                        </div>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {coupon.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>
                            Min order: {formatPrice(coupon.minimumOrderAmount)}
                          </span>
                          <span>
                            Used: {coupon.userUsage}/{coupon.maxUsagePerUser}
                          </span>
                          {coupon.remainingUses > 0 && (
                            <span className="text-green-600 font-medium">
                              {coupon.remainingUses} remaining
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires: {formatDate(coupon.validUntil)}</span>
                        </div>
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available coupons</p>
                  <p className="text-sm text-gray-400">
                    Check back later for new offers!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={fetchCouponUsage}
            variant="outline"
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            Refresh Coupon Information
          </Button>
        </div>
      </div>
    </div>
  );
}
