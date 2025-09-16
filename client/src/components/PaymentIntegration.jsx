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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <h4 className="font-semibold mb-3">Select Payment Method</h4>
          <div className="space-y-3">
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "razorpay"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("razorpay")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">Razorpay</h5>
                  <p className="text-sm text-gray-600">
                    Pay with UPI, Cards, Net Banking, Wallets
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Smartphone className="w-3 h-3" />
                      <span>UPI</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CreditCard className="w-3 h-3" />
                      <span>Cards</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 className="w-3 h-3" />
                      <span>Net Banking</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Wallet className="w-3 h-3" />
                      <span>Wallets</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Recommended</Badge>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
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
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Payment Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(orderData.itemsPrice || 0)}</span>
            </div>
            {orderData.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatPrice(orderData.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>
                {orderData.shippingPrice === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(orderData.shippingPrice || 0)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST):</span>
              <span>{formatPrice(orderData.taxPrice || 0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatPrice(orderData.totalPrice || 0)}</span>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-green-800 mb-1">
                Secure Payment
              </h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  256-bit SSL encryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  PCI DSS compliant
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Your payment information is secure
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handleRazorpayPayment}
          disabled={loading || !razorpayLoaded || !addressValid}
          className="w-full"
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
            We accept all major credit cards, debit cards, UPI, net banking, and
            wallets
          </p>
          <p className="mt-1">Powered by Razorpay</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentIntegration;
