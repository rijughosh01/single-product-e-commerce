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
        setSummary({
          subtotal,
          tax,
          shipping,
          discount: 0,
          total: subtotal + tax + shipping,
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
    items: cart.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    })),
    subtotal: summary?.subtotal ?? cartTotal,
    tax: summary?.tax ?? 0,
    shipping: summary?.shipping ?? 0,
    discount: summary?.discount ?? 0,
    total:
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
  };

  if (
    authLoading ||
    cartLoading ||
    !isAuthenticated ||
    cartCount === 0 ||
    loadingSummary
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                1
              </span>
              Cart
            </div>
            <div className="h-[1px] w-12 bg-gray-300" />
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold">
                2
              </span>
              Address
            </div>
            <div className="h-[1px] w-12 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-semibold">
                3
              </span>
              Payment
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-center text-gray-900">
            Secure Checkout
          </h1>
          <p className="text-center text-gray-600">
            Select delivery address and complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Order items + Price breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Selection */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <AddressSelector
                  selectedAddress={selectedAddress}
                  onAddressSelect={handleAddressSelect}
                  onAddressChange={handleAddressChange}
                />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-gray-200">
                        <img
                          src={
                            item.product.images[0]?.url ||
                            "/placeholder-ghee.jpg"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {item.product.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {item.product.type} • {item.product.size}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              Qty {item.quantity}
                            </div>
                            <div className="text-base font-semibold text-gray-900">
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
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Price Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₹{(summary?.subtotal ?? 0).toFixed(2)}
                    </span>
                  </div>
                  {summary?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{(summary.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {summary?.shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${(summary?.shipping ?? 0).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-medium">
                      ₹{(summary?.tax ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t text-base font-semibold">
                    <span>Total</span>
                    <span>₹{(orderData.total || 0).toFixed(2)}</span>
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
