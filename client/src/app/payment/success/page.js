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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your order. We have received your payment and will
            process your order soon.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-mono text-sm">{order._id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Date</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method</span>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Razorpay</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="default">{order.orderStatus}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 py-3 border-b last:border-b-0"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                        <img
                          src={
                            typeof item.image === "string"
                              ? item.image
                              : item.image?.url || "/placeholder-ghee.jpg"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{order.shippingInfo.name}</p>
                  <p>{order.shippingInfo.address}</p>
                  <p>
                    {order.shippingInfo.city}, {order.shippingInfo.state} -{" "}
                    {order.shippingInfo.pincode}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.shippingInfo.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={downloadInvoice}
                  disabled={downloadingInvoice}
                  className="w-full"
                >
                  {downloadingInvoice ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/orders/${order._id}`)}
                  className="w-full"
                >
                  View Order Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/orders")}
                  className="w-full"
                >
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What is Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-orange-600">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Order Confirmation</p>
                      <p className="text-xs text-gray-600">
                        You will receive an email confirmation shortly
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-orange-600">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Processing</p>
                      <p className="text-xs text-gray-600">
                        We will prepare your order for shipping
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-orange-600">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Shipping</p>
                      <p className="text-xs text-gray-600">
                        Your order will be shipped within 1-2 business days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>support@pureghee.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>+91 98765 43210</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/contact")}
                    className="w-full"
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <Button
            onClick={() => router.push("/products")}
            size="lg"
            className="px-8"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
