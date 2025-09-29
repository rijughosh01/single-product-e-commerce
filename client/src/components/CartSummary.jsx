"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Tag,
  Truck,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cartAPI, couponsAPI, shippingAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const CartSummary = ({ onProceedToCheckout, className = "" }) => {
  const { cart } = useCart();
  const [cartSummary, setCartSummary] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchCartSummary();
  }, []);

  // Recalculate summary when cart changes
  useEffect(() => {
    if (cart && cart.length > 0) {
      const summary = calculateCartSummary(cart, appliedCoupon);
      console.log("Cart summary calculated:", summary);
      setCartSummary(summary);
    } else {
      console.log("Cart is empty, setting summary to null");
      setCartSummary(null);
    }
  }, [cart, appliedCoupon]);

  // Recalculate shipping when cart summary changes
  useEffect(() => {
    if (cartSummary && shippingInfo && shippingInfo.pincode) {
      const orderAmount = cartSummary.subtotal || 0;
      const freeShippingThreshold = shippingInfo.freeShippingThreshold || 1000;

      if (
        orderAmount >= freeShippingThreshold &&
        shippingInfo.shippingCharge > 0
      ) {
        setShippingInfo((prev) => ({
          ...prev,
          shippingCharge: 0,
        }));
      } else if (
        orderAmount < freeShippingThreshold &&
        shippingInfo.shippingCharge === 0
      ) {
        setShippingInfo((prev) => ({
          ...prev,
          shippingCharge: 50,
        }));
      }
    }
  }, [cartSummary, shippingInfo]);

  const calculateCartSummary = (cartItems, coupon = null) => {
    if (!cartItems || cartItems.length === 0) {
      return null;
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const tax = subtotal * 0.12;
    const freeShippingThreshold = 1000;
    const shipping = subtotal >= freeShippingThreshold ? 0 : 50;

    // Calculate discount based on applied coupon
    let discount = 0;
    if (coupon) {
      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.discountValue) / 100;
      } else {
        discount = coupon.discountValue || coupon.discount || 0;
      }
    }

    const total = subtotal + tax + shipping - discount;

    return {
      itemCount: cartItems.length,
      subtotal,
      tax,
      shipping,
      discount,
      total,
    };
  };

  const fetchCartSummary = async (coupon = null) => {
    setLoading(true);
    try {
      const response = await cartAPI.getCartSummary(coupon);

      setCartSummary(response.data.summary || response.data);
    } catch (error) {
      console.error("Error fetching cart summary:", error);

      const summary = calculateCartSummary(cart, coupon);
      setCartSummary(summary);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (isRetry = false) => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    // Calculate subtotal from cart if cartSummary is not available
    let subtotal = 0;
    if (cartSummary && cartSummary.subtotal) {
      subtotal = cartSummary.subtotal;
    } else if (cart && cart.length > 0) {
      subtotal = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
    }

    if (!subtotal || subtotal <= 0 || isNaN(subtotal)) {
      toast.error("Cart is empty or subtotal not calculated");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const requestData = {
        code: couponCode.trim(),
        orderAmount: Number(subtotal),
      };

      const response = await couponsAPI.validateCoupon(requestData);
      if (response.data.success) {
        const couponData = response.data.coupon;
        setAppliedCoupon(couponData);
        setRetryCount(0);

        // Show success message with usage info
        const usageInfo =
          couponData.userUsage > 0
            ? ` (Used ${couponData.userUsage}/${couponData.maxUsagePerUser} times)`
            : "";
        toast.success(`Coupon applied successfully!${usageInfo}`);

        try {
          if (couponCode?.trim()) {
            localStorage.setItem("checkoutCouponCode", couponCode.trim());
          }
        } catch (e) {}
        await fetchCartSummary(couponCode.trim());
      } else {
        const errorMessage = response.data.message || "Invalid coupon code";
        setCouponError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      // Handle different types of errors with specific messages
      let errorMessage = "Failed to apply coupon";
      let shouldRetry = false;
      let shouldLogError = true;

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        switch (status) {
          case 400:
            shouldLogError = false;
            errorMessage =
              serverMessage ||
              "Invalid coupon code or cannot be applied to this order";
            break;
          case 401:
            errorMessage = "Please log in to apply coupons";
            break;
          case 404:
            shouldLogError = false;
            errorMessage = `Coupon "${couponCode.trim()}" not found. Please check the code and try again.`;
            break;
          case 429:
            errorMessage =
              "Too many attempts. Please wait a moment before trying again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            shouldRetry = true;
            break;
          default:
            errorMessage = serverMessage || "Failed to validate coupon";
            shouldRetry = true;
        }
      } else if (
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error"
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
        shouldRetry = true;
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
        shouldRetry = true;
      } else {
        errorMessage = error.message || "An unexpected error occurred";
        shouldRetry = true;
      }

      // Only log unexpected errors to console
      if (shouldLogError) {
        console.error("Coupon validation error:", error);
      }

      setCouponError(errorMessage);

      // Auto-retry for network errors (max 2 retries)
      if (shouldRetry && retryCount < 2 && !isRetry) {
        setRetryCount((prev) => prev + 1);
        toast.error(`${errorMessage} Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => {
          handleApplyCoupon(true);
        }, 1000 * (retryCount + 1));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    setRetryCount(0);
    try {
      localStorage.removeItem("checkoutCouponCode");
    } catch (e) {}
    await fetchCartSummary();
    toast.success("Coupon removed");
  };

  const calculateShipping = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;

    setShippingLoading(true);
    try {
      const response = await shippingAPI.calculateShipping({
        pincode,
        orderAmount: cartSummary?.subtotal || 0,
      });

      const shippingData = response.data.shipping || response.data;

      // Handle estimatedDelivery object format
      let estimatedDeliveryText = "3-5 business days";
      if (shippingData.estimatedDelivery) {
        if (typeof shippingData.estimatedDelivery === "object") {
          const { min, max, minDate, maxDate } = shippingData.estimatedDelivery;
          if (minDate && maxDate) {
            estimatedDeliveryText = `${min}-${max} business days`;
          } else if (min && max) {
            estimatedDeliveryText = `${min}-${max} business days`;
          }
        } else {
          estimatedDeliveryText = shippingData.estimatedDelivery;
        }
      }

      // Calculate shipping charge with free shipping logic
      const orderAmount = cartSummary?.subtotal || 0;
      const freeShippingThreshold = shippingData.freeShippingThreshold || 1000;
      let shippingCharge =
        shippingData.shippingCharges || shippingData.shippingCharge || 0;

      if (orderAmount >= freeShippingThreshold) {
        shippingCharge = 0;
      }

      setShippingInfo({
        pincode,
        shippingCharge,
        estimatedDelivery: estimatedDeliveryText,
        freeShippingThreshold,
      });

      try {
        if (pincode) {
          localStorage.setItem("checkoutPincode", String(pincode));
        }
      } catch (e) {}
    } catch (error) {
      console.error("Error calculating shipping:", error);
      // Fallback: use simple shipping calculation
      const subtotal = cartSummary?.subtotal || 0;
      const freeShippingThreshold = 1000;
      const shippingCharge = subtotal >= freeShippingThreshold ? 0 : 50;
      setShippingInfo({
        pincode,
        shippingCharge,
        estimatedDelivery: "3-5 business days",
        freeShippingThreshold,
      });
      try {
        if (pincode) {
          localStorage.setItem("checkoutPincode", String(pincode));
        }
      } catch (e) {}
    } finally {
      setShippingLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading cart summary...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cartSummary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No items in cart</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${className} shadow-xl border-0 bg-white/80 backdrop-blur-sm`}
    >
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingCart className="w-6 h-6" />
          Cart Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Coupon Section */}
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
            <Tag className="w-5 h-5 text-orange-500" />
            Coupon Code
          </label>
          {appliedCoupon ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="text-sm font-bold text-green-800">
                      {appliedCoupon.code} applied
                    </span>
                    <Badge className="ml-2 bg-green-500 text-white text-xs">
                      {(() => {
                        const type =
                          appliedCoupon.type || appliedCoupon.discountType;
                        const value =
                          appliedCoupon.value ??
                          appliedCoupon.discountValue ??
                          appliedCoupon.discount;
                        if (type === "percentage") return `${value}% off`;
                        return `${formatPrice(Number(value) || 0)} off`;
                      })()}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Usage Information */}
              {(appliedCoupon.userUsage !== undefined ||
                appliedCoupon.remainingUses !== undefined) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700 font-medium">
                      Usage Information:
                    </span>
                    <div className="flex items-center gap-4 text-blue-600">
                      {appliedCoupon.userUsage !== undefined && (
                        <span>
                          Used: {appliedCoupon.userUsage}/
                          {appliedCoupon.maxUsagePerUser || 1}
                        </span>
                      )}
                      {appliedCoupon.remainingUses !== undefined && (
                        <span>Remaining: {appliedCoupon.remainingUses}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                  className={`flex-1 rounded-xl border-2 transition-all duration-300 ${
                    couponError
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  }`}
                />
                <Button
                  onClick={() => handleApplyCoupon()}
                  disabled={couponLoading || !couponCode.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all duration-300"
                >
                  {couponLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>

              {/* Error message with retry button */}
              {couponError && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{couponError}</span>
                  </div>
                  {(retryCount > 0 ||
                    couponError.includes("Network") ||
                    couponError.includes("timeout") ||
                    couponError.includes("Server error")) && (
                    <Button
                      onClick={() => {
                        setRetryCount(0);
                        handleApplyCoupon();
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Shipping Calculator */}
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
            <Truck className="w-5 h-5 text-orange-500" />
            Shipping Calculator
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter pincode"
              maxLength={6}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length === 6) {
                  calculateShipping(value);
                }
              }}
              className="flex-1 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
            />
          </div>
          {shippingLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 p-3 bg-gray-50 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating shipping...
            </div>
          )}
          {shippingInfo && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-800">
                  Shipping to {shippingInfo.pincode}
                </span>
                <span className="text-sm font-bold text-blue-800">
                  {shippingInfo.shippingCharge === 0 ? (
                    <Badge className="bg-green-500 text-white text-xs">
                      FREE
                    </Badge>
                  ) : (
                    formatPrice(shippingInfo.shippingCharge)
                  )}
                </span>
              </div>
              {shippingInfo.estimatedDelivery && (
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  Estimated delivery: {shippingInfo.estimatedDelivery}
                </p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <span className="text-gray-700">
              Subtotal ({cartSummary.itemCount} items)
            </span>
            <span className="font-bold">
              {formatPrice(cartSummary.subtotal)}
            </span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-base text-green-600 font-medium">
              <span>Discount ({appliedCoupon.code})</span>
              <span className="font-bold">
                -
                {formatPrice(
                  Number(cartSummary.discount) ||
                    Number(appliedCoupon.discount) ||
                    0
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-medium">
            <span className="text-gray-700">Shipping</span>
            <span className="font-bold">
              {shippingInfo ? (
                shippingInfo.shippingCharge === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(shippingInfo.shippingCharge)
                )
              ) : (cartSummary?.subtotal || 0) >=
                (shippingInfo?.freeShippingThreshold || 1000) ? (
                <span className="text-green-600">FREE</span>
              ) : (
                "TBD"
              )}
            </span>
          </div>

          <div className="flex justify-between text-base font-medium">
            <span className="text-gray-700">Tax (GST)</span>
            <span className="font-bold">{formatPrice(cartSummary.tax)}</span>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl">
            <span className="text-gray-900">Total</span>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {formatPrice(
                (cartSummary.subtotal || 0) +
                  (cartSummary.tax || 0) +
                  (shippingInfo
                    ? shippingInfo.shippingCharge || 0
                    : (cartSummary.subtotal || 0) >= 1000
                    ? 0
                    : 50) -
                  (cartSummary.discount || 0)
              )}
            </span>
          </div>
        </div>

        {/* Free Shipping Notice */}
        {(() => {
          const freeShippingThreshold =
            shippingInfo?.freeShippingThreshold || 1000;
          const qualifiesForFreeShipping =
            (cartSummary.subtotal || 0) >= freeShippingThreshold;

          if (qualifiesForFreeShipping) {
            return (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-bold text-green-800">
                  🎉 You qualify for free shipping!
                </span>
              </div>
            );
          } else {
            const amountNeeded =
              freeShippingThreshold - (cartSummary.subtotal || 0);
            return (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-800">
                  Add {formatPrice(amountNeeded)} more for free shipping
                </span>
              </div>
            );
          }
        })()}

        {/* Proceed to Checkout Button */}
        <Button
          onClick={onProceedToCheckout}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          size="lg"
        >
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
};

export default CartSummary;
