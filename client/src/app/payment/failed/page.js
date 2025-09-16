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
  CreditCard,
  AlertTriangle,
  Phone,
  Mail,
  HelpCircle,
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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600">
            We are sorry, but your payment could not be processed at this time.
          </p>
        </div>

        {/* Error Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Error Message
                </p>
                <p className="text-gray-900">{getErrorMessage()}</p>
              </div>

              {errorCode && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Error Code
                  </p>
                  <Badge variant="outline">{errorCode}</Badge>
                </div>
              )}

              {paymentId && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Payment ID
                  </p>
                  <p className="font-mono text-sm text-gray-900">{paymentId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              What you can do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getErrorSuggestions().map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="w-full"
            >
              {retrying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Try Again
            </Button>
            <Button
              onClick={handleGoToCart}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </div>

          <Button onClick={handleGoHome} variant="ghost" className="w-full">
            Continue Shopping
          </Button>
        </div>

        {/* Support Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you continue to experience issues, please contact our support
                team.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>support@pureghee.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>+91 98765 43210</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => router.push("/contact")}
                className="w-full sm:w-auto"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-2">
                Supported Payment Methods
              </h3>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span>UPI</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Net Banking</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Wallets</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Powered by Razorpay</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
