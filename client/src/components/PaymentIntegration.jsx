"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Smartphone,
  Building2,
  Wallet,
  Banknote,
  HandCoins,
} from "lucide-react";
import { paymentAPI } from "@/lib/api";
import { toast } from "sonner";

const PaymentIntegration = ({
  orderData,
  onPaymentSuccess,
  onPaymentError,
  className = "",
  addressValid = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast.error("Payment system unavailable");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const createRazorpayOrder = async () => {
    try {
      // Validate required data
      if (!orderData.totalPrice || orderData.totalPrice <= 0) {
        throw new Error("Invalid total price");
      }

      if (!orderData.orderItems || orderData.orderItems.length === 0) {
        throw new Error("No items in order");
      }

      if (!orderData.shippingInfo) {
        throw new Error("Shipping information is required");
      }

      const requestData = {
        amount: Number(orderData.totalPrice),
        currency: "INR",
        orderData: orderData,
      };

      console.log("Creating Razorpay order with data:", {
        amount: requestData.amount,
        currency: requestData.currency,
        orderData: {
          userId: orderData.userId,
          orderItems: orderData.orderItems?.length,
          totalPrice: orderData.totalPrice,
          shippingInfo: orderData.shippingInfo ? "present" : "missing",
        },
      });

      const response = await paymentAPI.createPaymentOrder(requestData);
      return response.data;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      console.error("Error details:", error.response?.data);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      console.log("Verifying payment with data:", {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
          ? "present"
          : "missing",
        orderData: paymentData.orderData
          ? {
              userId: paymentData.orderData.userId,
              orderItems: paymentData.orderData.orderItems?.length,
              totalPrice: paymentData.orderData.totalPrice,
              shippingInfo: paymentData.orderData.shippingInfo
                ? "present"
                : "missing",
            }
          : "missing",
      });

      const response = await paymentAPI.verifyPayment(paymentData);
      console.log("Verification response:", response);
      console.log("Response data:", response.data);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.data && !response.data.success) {
        console.error("Server returned error:", response.data);
        return response.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      console.error("Error response:", error.response?.data);

      return {
        success: false,
        message: error.response?.data?.message || "Payment verification failed",
        error: error.message,
      };
    }
  };

  const handleCODPayment = async () => {
    if (!addressValid || !orderData.shippingInfo) {
      toast.error(
        "Please select a delivery address before proceeding to payment"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await paymentAPI.createCODOrder({ orderData });

      if (response.data && response.data.success) {
        toast.success("COD order placed successfully!");
        onPaymentSuccess(response.data.order);
      } else {
        throw new Error(response.data?.message || "COD order creation failed");
      }
    } catch (error) {
      console.error("COD order error:", error);
      const message = error.response?.data?.message || "COD order failed";
      toast.error(message);
      onPaymentError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment system is loading, please wait...");
      return;
    }

    if (!addressValid || !orderData.shippingInfo) {
      toast.error(
        "Please select a delivery address before proceeding to payment"
      );
      return;
    }

    setLoading(true);
    try {
      const orderResponse = await createRazorpayOrder();
      const { order } = orderResponse;

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Ghee Store",
        description: `Order #${order.receipt}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderData,
            };

            const verificationResponse = await verifyPayment(verificationData);

            console.log("Verification response:", verificationResponse); // Debug log

            if (verificationResponse && verificationResponse.success) {
              toast.success("Payment successful!");

              if (
                verificationResponse.order &&
                verificationResponse.order._id
              ) {
                window.location.href = `/payment/success?order_id=${verificationResponse.order._id}&payment_id=${response.razorpay_payment_id}`;
              } else {
                console.error(
                  "Order not found in verification response:",
                  verificationResponse
                );
                toast.error("Order creation failed. Please contact support.");
                onPaymentError("Order creation failed");
              }
            } else {
              console.error(
                "Payment verification failed:",
                verificationResponse
              );
              toast.error("Payment verification failed");
              onPaymentError("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            onPaymentError("Payment verification failed");
          }
        },
        prefill: {
          name: orderData.shippingInfo?.name || "",
          email: orderData.userId || "",
          contact: orderData.shippingInfo?.phone || "",
        },
        notes: {
          order_id: orderResponse.orderId,
          customer_id: orderData.userId,
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info("Payment cancelled");
            window.location.href = `/payment/failed?error_code=PAYMENT_CANCELLED&error_description=Payment was cancelled by the user`;
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      const message = error.response?.data?.message || "Payment failed";
      toast.error(message);
      onPaymentError(message);
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

  return (
    <Card
      className={`${className} shadow-xl border-0 bg-white/80 backdrop-blur-sm`}
    >
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Payment Method Selection */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Select Payment Method
          </h4>
          <div className="space-y-4">
            <div
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                paymentMethod === "razorpay"
                  ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg"
                  : "border-gray-200 hover:border-orange-300 hover:shadow-md bg-white"
              }`}
              onClick={() => setPaymentMethod("razorpay")}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-md flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                      Razorpay
                    </h5>
                    {/* <p className="text-sm text-gray-600 font-medium mb-3">
                      Pay with UPI, Cards, Net Banking, Wallets
                    </p> */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Smartphone className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">UPI</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Cards</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Net Banking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Wallet className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Wallets</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Recommended
                  </Badge>
                  <div
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      paymentMethod === "razorpay"
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "razorpay" && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cash on Delivery Option */}
            <div
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                paymentMethod === "cod"
                  ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg"
                  : "border-gray-200 hover:border-orange-300 hover:shadow-md bg-white"
              }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-md flex-shrink-0">
                    <HandCoins className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                      Cash on Delivery
                    </h5>
                    <p className="text-sm text-gray-600 font-medium mb-3">
                      Pay when your order is delivered
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Banknote className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Cash Payment</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">No Online Payment</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Safe & Easy
                  </Badge>
                  <div
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      paymentMethod === "cod"
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-6 rounded-2xl border border-orange-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Payment Summary
          </h4>
          <div className="space-y-4 text-base">
            <div className="flex justify-between font-medium">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-bold">
                {formatPrice(orderData.itemsPrice || 0)}
              </span>
            </div>
            {orderData.discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount:</span>
                <span className="font-bold">
                  -{formatPrice(orderData.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span className="text-gray-700">Shipping:</span>
              <span className="font-bold">
                {orderData.shippingPrice === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(orderData.shippingPrice || 0)
                )}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-700">Tax (GST):</span>
              <span className="font-bold">
                {formatPrice(orderData.taxPrice || 0)}
              </span>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl">
              <span className="text-gray-900">Total:</span>
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {formatPrice(orderData.totalPrice || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h5 className="text-lg font-bold text-green-800 mb-3">
                🔒 Secure Payment
              </h5>
              <ul className="text-sm text-green-700 space-y-2">
                <li className="flex items-center gap-3 font-medium">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  256-bit SSL encryption
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  PCI DSS compliant
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Your payment information is secure
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={
            paymentMethod === "cod" ? handleCODPayment : handleRazorpayPayment
          }
          disabled={
            loading ||
            (!razorpayLoaded && paymentMethod === "razorpay") ||
            !addressValid
          }
          className={`w-full font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
            paymentMethod === "cod"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          }`}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : !addressValid ? (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              Select Address First
            </>
          ) : paymentMethod === "cod" ? (
            <>
              <HandCoins className="w-5 h-5 mr-2" />
              Place COD Order - {formatPrice(orderData.totalPrice || 0)}
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Pay {formatPrice(orderData.totalPrice || 0)}
            </>
          )}
        </Button>

        {!razorpayLoaded && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="w-4 h-4" />
            Loading payment system...
          </div>
        )}

        {/* Payment Methods Info */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            {paymentMethod === "cod"
              ? "Pay securely when your order is delivered to your doorstep"
              : "We accept all major credit cards, debit cards, UPI, net banking, and wallets"}
          </p>
          <p className="mt-1">
            {paymentMethod === "cod"
              ? "Cash on Delivery - Safe & Convenient"
              : "Powered by Razorpay"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentIntegration;
