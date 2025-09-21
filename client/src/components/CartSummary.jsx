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
    const tax = subtotal * 0.18;
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

  const handleApplyCoupon = async () => {
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

    // console.log("=== COUPON VALIDATION DEBUG ===");
    // console.log("Coupon code:", couponCode.trim());
    // console.log("Cart summary:", cartSummary);
    // console.log("Cart items:", cart);
    // console.log("Calculated subtotal:", subtotal);
    // console.log("Subtotal type:", typeof subtotal);
    // console.log("Subtotal is valid:", !isNaN(subtotal) && subtotal > 0);

    if (!subtotal || subtotal <= 0 || isNaN(subtotal)) {
      toast.error("Cart is empty or subtotal not calculated");
      return;
    }

    setCouponLoading(true);
    try {
      const requestData = {
        code: couponCode.trim(),
        orderAmount: Number(subtotal),
      };

      console.log("Request data being sent:", requestData);
      console.log("Request data validation:", {
        hasCode: !!requestData.code,
        hasOrderAmount: !!requestData.orderAmount,
        codeValue: requestData.code,
        orderAmountValue: requestData.orderAmount,
        orderAmountType: typeof requestData.orderAmount,
      });

      const response = await couponsAPI.validateCoupon(requestData);
      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        // Persist for checkout page
        try {
          if (couponCode?.trim()) {
            localStorage.setItem("checkoutCouponCode", couponCode.trim());
          }
        } catch (e) {}
        await fetchCartSummary(couponCode.trim());
        toast.success("Coupon applied successfully!");
      } else {
        toast.error(response.data.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const message = error.response?.data?.message || "Failed to apply coupon";
      toast.error(message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    setCouponCode("");
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
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                className="flex-1 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
              />
              <Button
                onClick={handleApplyCoupon}
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
