"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  Truck,
  Home,
  User,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { ordersAPI, invoiceAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const orderId = params.id;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (orderId) {
      loadOrderDetails();
    }
  }, [isAuthenticated, orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrderById(orderId);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load order details");
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!order) return;

    try {
      setDownloadingInvoice(true);

      let invoiceId = order.invoice;

      // Prevent COD invoice access before delivery
      if (
        order?.paymentInfo?.method === "cod" &&
        order?.orderStatus !== "Delivered"
      ) {
        toast.info(
          "Invoice will be available after delivery for Cash on Delivery orders"
        );
        return;
      }

      // Generate invoice if not exists
      if (!invoiceId) {
        const generateResponse = await invoiceAPI.generateInvoice(order._id);
        invoiceId = generateResponse.data.invoice._id;

        setOrder((prevOrder) => ({
          ...prevOrder,
          invoice: invoiceId,
        }));
      }

      // Download invoice PDF
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

      if (error.response?.status === 403) {
        toast.info(
          error.response?.data?.message ||
            "Invoice will be available after delivery for Cash on Delivery orders"
        );
      } else if (
        error.response?.status === 400 ||
        error.response?.status === 500
      ) {
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

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setCancellingOrder(true);
      const response = await ordersAPI.cancelOrder(order._id, cancelReason);
      
      setOrder(prevOrder => ({
        ...prevOrder,
        orderStatus: "Cancelled",
        cancelledAt: new Date(),
        refundInfo: response.data.refundInfo
      }));
      
      setShowCancelModal(false);
      setCancelReason("");
      
      if (response.data.refundInfo) {
        toast.success("Order cancelled successfully. Refund has been initiated and will be processed within 5-7 business days.");
      } else {
        toast.success("Order cancelled successfully.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrder(false);
    }
  };

  const canCancelOrder = () => {
    return order && 
           order.orderStatus !== "Delivered" && 
           order.orderStatus !== "Shipped" && 
           order.orderStatus !== "Cancelled" &&
           order.orderStatus !== "Returned";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Out for Delivery":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Returned":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing":
        return <Clock className="h-4 w-4" />;
      case "Confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "Shipped":
        return <Truck className="h-4 w-4" />;
      case "Out for Delivery":
        return <Truck className="h-4 w-4" />;
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "Cancelled":
        return <Package className="h-4 w-4" />;
      case "Returned":
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Order not found
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The order you are looking for does not exist or you do not have
            permission to view it.
          </p>
          <Button
            onClick={() => router.push("/orders")}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            View All Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/orders")}
                className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">
                  Order Details
                </h1>
                <p className="text-xl text-gray-600">Order #{order._id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`px-4 py-2 text-sm font-semibold ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {getStatusIcon(order.orderStatus)}
                <span className="ml-2">{order.orderStatus}</span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Timeline */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📋</span>
                  </div>
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Order Placed - Always shown */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900">
                        Order Placed
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Confirmed - Show if paid */}
                  {order.paidAt && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-green-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Payment Confirmed
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.paidAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Processing - Show if status is Processing or higher */}
                  {(order.orderStatus === "Processing" ||
                    order.orderStatus === "Confirmed" ||
                    order.orderStatus === "Shipped" ||
                    order.orderStatus === "Out for Delivery" ||
                    order.orderStatus === "Delivered") && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-yellow-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Processing
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.paidAt
                            ? formatDate(order.paidAt)
                            : formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Confirmed - Show if status is Confirmed or higher */}
                  {(order.orderStatus === "Confirmed" ||
                    order.orderStatus === "Shipped" ||
                    order.orderStatus === "Out for Delivery" ||
                    order.orderStatus === "Delivered") && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Confirmed
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.paidAt
                            ? formatDate(order.paidAt)
                            : formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shipped - Show if status is Shipped or higher */}
                  {(order.orderStatus === "Shipped" ||
                    order.orderStatus === "Out for Delivery" ||
                    order.orderStatus === "Delivered") && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-purple-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Shipped
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.shippedAt
                            ? formatDate(order.shippedAt)
                            : formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Out for Delivery - Show if status is Out for Delivery or Delivered */}
                  {(order.orderStatus === "Out for Delivery" ||
                    order.orderStatus === "Delivered") && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-orange-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Out for Delivery
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.outForDeliveryAt
                            ? formatDate(order.outForDeliveryAt)
                            : formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delivered - Show only if status is Delivered */}
                  {order.orderStatus === "Delivered" && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-green-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Delivered
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.deliveredAt
                            ? formatDate(order.deliveredAt)
                            : formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cancelled - Show if status is Cancelled */}
                  {order.orderStatus === "Cancelled" && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-red-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Cancelled
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.cancelledAt
                            ? formatDate(order.cancelledAt)
                            : formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
                <div className="space-y-6">
                  {order.orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-6 p-6 bg-gradient-to-r from-white to-orange-50 border border-orange-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={
                            typeof item.image === "string"
                              ? item.image
                              : item.image?.url || "/placeholder-ghee.jpg"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {/* <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.quantity}
                        </div> */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Price: {formatPrice(item.price)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-6 self-start">
            {/* Customer Information */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">👤</span>
                  </div>
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-orange-500" />
                    <span className="text-base font-semibold text-gray-900">
                      {order.user?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-orange-500" />
                    <span className="text-base font-medium text-gray-700">
                      {order.user?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-orange-500" />
                    <span className="text-base font-medium text-gray-700">
                      {order.shippingInfo?.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📍</span>
                  </div>
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-base text-gray-900 font-semibold">
                    {order.shippingInfo?.name || "N/A"}
                  </p>
                  <p className="text-base text-gray-700">
                    {order.shippingInfo?.address || "N/A"}
                  </p>
                  <p className="text-base text-gray-700">
                    {order.shippingInfo?.city || "N/A"},{" "}
                    {order.shippingInfo?.state || "N/A"}
                  </p>
                  <p className="text-base text-gray-700 font-medium">
                    {order.shippingInfo?.pincode || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">💳</span>
                  </div>
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600 font-medium">
                      Method:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {order.paymentInfo?.method || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600 font-medium">
                      Status:
                    </span>
                    <span
                      className={`text-base font-semibold ${
                        order.paymentInfo?.status === "succeeded"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.paymentInfo?.status || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600 font-medium">
                      Paid At:
                    </span>
                    <span className="text-base font-medium text-gray-700">
                      {order.paidAt ? formatDate(order.paidAt) : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">💰</span>
                  </div>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-base">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Items Price:</span>
                    <span className="font-bold">
                      {formatPrice(order.itemsPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Tax (GST):</span>
                    <span className="font-bold">
                      {formatPrice(order.taxPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Shipping:</span>
                    <span className="font-bold">
                      {order.shippingPrice === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(order.shippingPrice || 0)
                      )}
                    </span>
                  </div>
                  {order.coupon && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Coupon Discount:</span>
                      <span className="font-bold">
                        -
                        {formatPrice(
                          order.coupon.discountApplied ||
                            order.coupon.discount ||
                            0
                        )}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl">
                    <span className="text-gray-900">Total</span>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {formatPrice(order.totalPrice || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Information */}
            {order.refundInfo && order.refundInfo.refundId && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">💰</span>
                    </div>
                    Refund Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 font-medium">Refund ID:</span>
                      <span className="text-base font-semibold text-gray-900">
                        {order.refundInfo.refundId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 font-medium">Amount:</span>
                      <span className="text-base font-semibold text-green-600">
                        {formatPrice(order.refundInfo.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 font-medium">Status:</span>
                      <Badge className={`px-3 py-1 text-sm font-semibold ${
                        order.refundInfo.status === "processed" 
                          ? "bg-green-100 text-green-800 border-green-200"
                          : order.refundInfo.status === "failed"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}>
                        {order.refundInfo.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 font-medium">Reason:</span>
                      <span className="text-base font-medium text-gray-700">
                        {order.refundInfo.reason}
                      </span>
                    </div>
                    {order.refundInfo.refundedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-base text-gray-600 font-medium">Refunded At:</span>
                        <span className="text-base font-medium text-gray-700">
                          {formatDate(order.refundInfo.refundedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">⚡</span>
                  </div>
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={downloadInvoice}
                  disabled={downloadingInvoice}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  {downloadingInvoice ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download Invoice
                </Button>
                
                {canCancelOrder() && (
                  <Button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancellingOrder}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    {cancellingOrder ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Cancel Order
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={loadOrderDetails}
                  className="w-full hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this order..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {cancelReason.length}/500 characters
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Important Information:</p>
                  <ul className="text-yellow-700 space-y-1 text-xs">
                    <li>• Your order will be cancelled immediately</li>
                    <li>• If payment was made, refund will be initiated automatically</li>
                    <li>• Refund will be processed within 5-7 business days</li>
                    <li>• Product stock will be restored</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                variant="outline"
                className="flex-1 hover:bg-gray-50"
              >
                Keep Order
              </Button>
              <Button
                onClick={handleCancelOrder}
                disabled={cancellingOrder || !cancelReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {cancellingOrder ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Cancel Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
