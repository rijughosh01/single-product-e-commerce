"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Download,
  ShoppingBag,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";
import { ordersAPI, invoiceAPI } from "@/lib/api";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    } else {
      router.push("/");
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrderById(orderId);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load order details");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!order) return;

    try {
      setDownloadingInvoice(true);

      let invoiceId = order.invoice;

      // Generate invoice if not exists
      if (!invoiceId) {
        const generateResponse = await invoiceAPI.generateInvoice(order._id);
        invoiceId = generateResponse.data.invoice._id;

        setOrder((prevOrder) => ({
          ...prevOrder,
          invoice: invoiceId,
        }));
      }

      const response = await invoiceAPI.downloadInvoicePDF(invoiceId);

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);

      // Show coming soon message for invoice errors
      if (error.response?.status === 400 || error.response?.status === 500) {
        toast.info(
          "Invoice download feature coming soon! We're working on it."
        );
      } else {
        toast.error("Failed to download invoice. Please try again later.");
      }
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full animate-pulse flex items-center justify-center mb-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto">
            <span className="text-4xl">❌</span>
          </div>
          <p className="text-xl font-medium text-gray-700 mb-6">
            Order not found
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6 shadow-2xl animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Thank you for your order! We have received your payment and will
            process your order soon. You will receive a confirmation email
            shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Summary */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Order ID</span>
                    <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                      {order._id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <span className="text-gray-700 font-medium">
                      Order Date
                    </span>
                    <span className="font-semibold">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <span className="text-gray-700 font-medium">
                      Payment Method
                    </span>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">Razorpay</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Status</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-4 py-2 rounded-full">
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                    <span className="text-xl font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <span className="text-lg">🛒</span>
                  </div>
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {order.orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-6 p-6 bg-gradient-to-r from-white to-orange-50 border border-orange-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={
                            typeof item.image === "string"
                              ? item.image
                              : item.image?.url || "/placeholder-ghee.jpg"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {/* <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white min-w-[28px] h-7 flex items-center justify-center">
                          {item.quantity}
                        </div> */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <MapPin className="w-5 h-5" />
                  </div>
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-blue-500">👤</span>
                      {order.shippingInfo.name}
                    </h4>
                    <div className="space-y-3">
                      <p className="text-base font-medium flex items-center gap-2">
                        <span className="text-gray-500">📍</span>
                        {order.shippingInfo.address}
                      </p>
                      <p className="text-base font-medium flex items-center gap-2">
                        <span className="text-gray-500">🏙️</span>
                        {order.shippingInfo.city}, {order.shippingInfo.state} -{" "}
                        {order.shippingInfo.pincode}
                      </p>
                      <p className="text-base font-medium flex items-center gap-2">
                        <span className="text-gray-500">📞</span>
                        {order.shippingInfo.phone}
                      </p>
                    </div>
                  </div>
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
                  onClick={downloadInvoice}
                  disabled={downloadingInvoice}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {downloadingInvoice ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  ) : (
                    <Download className="w-5 h-5 mr-3" />
                  )}
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/orders/${order._id}`)}
                  className="w-full border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 rounded-xl transition-all duration-300 font-semibold py-3 text-lg"
                >
                  View Order Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/orders")}
                  className="w-full border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 rounded-xl transition-all duration-300 font-semibold py-3 text-lg"
                >
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <span className="text-lg">📋</span>
                  </div>
                  What is Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900">
                        Order Confirmation
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        You will receive an email confirmation shortly
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900">
                        Processing
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        We will prepare your order for shipping
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-sm font-bold text-white">3</span>
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900">
                        Shipping
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        Your order will be shipped within 1-2 business days
                      </p>
                    </div>
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
