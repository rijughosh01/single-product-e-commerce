"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import PaymentIntegration from "@/components/PaymentIntegration";
import AddressSelector from "@/components/AddressSelector";
import { cartAPI } from "@/lib/api";
import { toast } from "sonner";

export default function Checkout() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    cart,
    cartTotal,
    cartCount,
    clearCart,
    loading: cartLoading,
  } = useCart();
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressValid, setAddressValid] = useState(false);

  useEffect(() => {
    if (authLoading || cartLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (cartCount === 0) {
      router.push("/cart");
      return;
    }
  }, [authLoading, cartLoading, isAuthenticated, cartCount, router]);

  // Load server-calculated summary
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingSummary(true);
        const couponCode = (() => {
          try {
            return localStorage.getItem("checkoutCouponCode");
          } catch (e) {
            return null;
          }
        })();
        const pincode = (() => {
          try {
            return localStorage.getItem("checkoutPincode");
          } catch (e) {
            return null;
          }
        })();

        const res = await cartAPI.getCartSummary(
          couponCode || undefined,
          pincode || undefined
        );
        let s = res.data?.summary || res.data;
        setSummary(s);
      } catch (e) {
        const subtotal = cartTotal || 0;
        const tax = subtotal * 0.18;
        const shipping = subtotal >= 1000 ? 0 : 50;
        const discount = 0;
        setSummary({
          subtotal,
          tax,
          shipping,
          discount,
          total: subtotal + tax + shipping - discount,
        });
      } finally {
        setLoadingSummary(false);
      }
    };
    load();
  }, [cartTotal]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setAddressValid(true);
  };

  const handleAddressChange = (address) => {
    // Recalculate shipping when address changes
    if (address?.pincode) {
      loadSummaryWithAddress(address.pincode);
    }
  };

  const loadSummaryWithAddress = async (pincode) => {
    try {
      setLoadingSummary(true);
      const couponCode = (() => {
        try {
          return localStorage.getItem("checkoutCouponCode");
        } catch (e) {
          return null;
        }
      })();

      const res = await cartAPI.getCartSummary(
        couponCode || undefined,
        pincode || undefined
      );
      let s = res.data?.summary || res.data;
      setSummary(s);
    } catch (e) {
      console.error("Error loading summary with address:", e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handlePaymentSuccess = (order) => {
    toast.success("Order placed successfully!");
    clearCart();
    router.push(`/orders/${order._id}`);
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    toast.error("Payment failed. Please try again.");
  };

  const orderData = {
    userId: user?._id,
    orderItems: cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0]?.url || "/placeholder-ghee.jpg",
    })),
    itemsPrice: summary?.subtotal ?? cartTotal,
    taxPrice: summary?.tax ?? 0,
    shippingPrice: summary?.shipping ?? 0,
    discount: summary?.discount ?? 0,
    totalPrice:
      (summary?.total ?? null) !== null
        ? summary.total
        : (summary?.subtotal ?? cartTotal) +
          (summary?.tax ?? 0) +
          (summary?.shipping ?? 0) -
          (summary?.discount ?? 0),
    shippingInfo: selectedAddress
      ? {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
        }
      : null,
    coupon: summary?.coupon || null,
  };

  if (
    authLoading ||
    cartLoading ||
    !isAuthenticated ||
    cartCount === 0 ||
    loadingSummary
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                1
              </span>
              <span className="font-medium">Cart</span>
            </div>
            <div className="h-1 w-16 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-3 text-orange-600 font-bold">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-lg">
                2
              </span>
              <span className="font-bold">Address</span>
            </div>
            <div className="h-1 w-16 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-3 text-gray-400">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold">
                3
              </span>
              <span className="font-medium">Payment</span>
            </div>
          </div>
          <h1 className="mt-8 text-5xl font-bold text-center text-gray-900 mb-4">
            Secure Checkout
          </h1>
          <p className="text-center text-xl text-gray-600 max-w-2xl mx-auto">
            Select delivery address and complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Order items + Price breakdown */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Selection */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📍</span>
                  </div>
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AddressSelector
                  selectedAddress={selectedAddress}
                  onAddressSelect={handleAddressSelect}
                  onAddressChange={handleAddressChange}
                />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">🛒</span>
                  </div>
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={item._id}
                      className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white to-orange-50 border border-orange-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={
                            item.product.images[0]?.url ||
                            "/placeholder-ghee.jpg"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        {/* <div className="absolute -top-2 -right-7 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white min-w-[28px] h-7 flex items-center justify-center">
                          {item.quantity}
                        </div> */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                              {item.product.type} • {item.product.size}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 font-medium">
                              Qty {item.quantity}
                            </div>
                            <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                              ₹{item.product.price * item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price breakdown */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">💰</span>
                  </div>
                  Price Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-base">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-bold">
                      ₹{(summary?.subtotal ?? 0).toFixed(2)}
                    </span>
                  </div>
                  {summary?.discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span className="font-bold">
                        -₹{(summary.discount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Shipping</span>
                    <span className="font-bold">
                      {summary?.shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${(summary?.shipping ?? 0).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Tax (GST)</span>
                    <span className="font-bold">
                      ₹{(summary?.tax ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl">
                    <span className="text-gray-900">Total</span>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      ₹{(orderData.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Payment */}
          <div className="lg:col-span-1">
            <PaymentIntegration
              orderData={orderData}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              addressValid={addressValid}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
