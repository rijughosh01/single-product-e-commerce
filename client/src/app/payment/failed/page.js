"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  AlertTriangle,
  Phone,
  Mail,
  HelpCircle,
  ShoppingBag,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export default function PaymentFailed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [retrying, setRetrying] = useState(false);

  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  const paymentId = searchParams.get("payment_id");

  const handleRetryPayment = () => {
    setRetrying(true);
    router.push("/checkout");
  };

  const handleGoToCart = () => {
    router.push("/cart");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const getErrorMessage = () => {
    if (errorDescription) {
      return errorDescription;
    }

    switch (errorCode) {
      case "PAYMENT_CANCELLED":
        return "Payment was cancelled by the user";
      case "PAYMENT_FAILED":
        return "Payment failed due to technical issues";
      case "INSUFFICIENT_FUNDS":
        return "Insufficient funds in your account";
      case "CARD_DECLINED":
        return "Your card was declined by the bank";
      case "NETWORK_ERROR":
        return "Network error occurred during payment";
      default:
        return "Payment failed due to an unknown error";
    }
  };

  const getErrorSuggestions = () => {
    switch (errorCode) {
      case "PAYMENT_CANCELLED":
        return [
          "Make sure you complete the payment process",
          "Check if you have sufficient funds",
          "Try using a different payment method",
        ];
      case "PAYMENT_FAILED":
        return [
          "Check your internet connection",
          "Try again in a few minutes",
          "Contact your bank if the issue persists",
        ];
      case "INSUFFICIENT_FUNDS":
        return [
          "Add money to your account",
          "Use a different payment method",
          "Check your account balance",
        ];
      case "CARD_DECLINED":
        return [
          "Contact your bank to authorize the transaction",
          "Try using a different card",
          "Check if your card is expired",
        ];
      case "NETWORK_ERROR":
        return [
          "Check your internet connection",
          "Try again in a few minutes",
          "Clear your browser cache and try again",
        ];
      default:
        return [
          "Try using a different payment method",
          "Check your internet connection",
          "Contact support if the issue persists",
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-6 shadow-2xl animate-pulse">
            <XCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Payment Failed!
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            We are sorry, but your payment could not be processed at this time.
            Do not worry, your items are still safe in your cart.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Error Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Error Summary */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl">
                    <span className="text-gray-700 font-medium">
                      Error Message
                    </span>
                    <span className="font-semibold text-red-600">
                      {getErrorMessage()}
                    </span>
                  </div>

                  {errorCode && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl">
                      <span className="text-gray-700 font-medium">
                        Error Code
                      </span>
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-4 py-2 rounded-full">
                        {errorCode}
                      </Badge>
                    </div>
                  )}

                  {paymentId && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl">
                      <span className="text-gray-700 font-medium">
                        Payment ID
                      </span>
                      <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                        {paymentId}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* What You Can Do */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  What You Can Do
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {getErrorSuggestions().map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                        <span className="text-sm font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-700">
                          {suggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Info */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  Supported Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Cards</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">UPI</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Net Banking</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Wallets</span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">Powered by Razorpay</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <span className="text-lg">⚡</span>
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={handleRetryPayment}
                  disabled={retrying}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {retrying ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  ) : (
                    <RefreshCw className="w-5 h-5 mr-3" />
                  )}
                  Try Again
                </Button>
                <Button
                  onClick={handleGoToCart}
                  variant="outline"
                  className="w-full border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 rounded-xl transition-all duration-300 font-semibold py-3 text-lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-3" />
                  Back to Cart
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 rounded-xl transition-all duration-300 font-semibold py-3 text-lg"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>

            {/* Common Issues */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <span className="text-lg">🔧</span>
                  </div>
                  Common Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <p className="font-bold text-base text-gray-900 mb-2">
                      Check Your Connection
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      Ensure you have a stable internet connection
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                    <p className="font-bold text-base text-gray-900 mb-2">
                      Verify Payment Method
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      Make sure your card details are correct
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                    <p className="font-bold text-base text-gray-900 mb-2">
                      Contact Your Bank
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      Some banks require transaction authorization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <span className="text-lg">🆘</span>
                  </div>
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-orange-50 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 text-base font-medium mb-3">
                      <Mail className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-900">
                        support@pureghee.com
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-base font-medium">
                      <Phone className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-900">+91 98765 43210</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/contact")}
                    className="w-full border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 rounded-xl transition-all duration-300 font-semibold py-3 text-lg"
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Button
            onClick={() => router.push("/products")}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            Continue Shopping
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
