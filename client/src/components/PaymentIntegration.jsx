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
} from "lucide-react";
import { ordersAPI } from "@/lib/api";
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
      const response = await ordersAPI.createPaymentOrder(orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await ordersAPI.verifyPayment(paymentData);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
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
              orderId: orderResponse.orderId,
            };

            const verificationResponse = await verifyPayment(verificationData);

            if (verificationResponse.success) {
              toast.success("Payment successful!");
              onPaymentSuccess(verificationResponse.order);
            } else {
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
          email: orderData.shippingInfo?.email || "",
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
              <span>{formatPrice(orderData.subtotal || 0)}</span>
            </div>
            {orderData.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatPrice(orderData.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{formatPrice(orderData.shipping || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST):</span>
              <span>{formatPrice(orderData.tax || 0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatPrice(orderData.total || 0)}</span>
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
              Pay {formatPrice(orderData.total || 0)}
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
