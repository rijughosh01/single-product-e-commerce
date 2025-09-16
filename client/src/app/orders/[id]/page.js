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
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Order not found
          </h3>
          <p className="text-gray-500 mb-4">
            The order you are looking for does not exist or you do not have
            permission to view it.
          </p>
          <Button onClick={() => router.push("/orders")}>
            View All Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/orders")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order Details
              </h1>
              <p className="text-gray-600">Order #{order._id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-full ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusIcon(order.orderStatus)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Status
                    </p>
                    <p className="text-lg font-semibold">{order.orderStatus}</p>
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
                      className="flex items-center gap-4 py-4 border-b last:border-b-0"
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
                        <p className="text-sm text-gray-600">
                          Price: {formatPrice(item.price)} each
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

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Placed - Always shown */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order Placed
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Confirmed - Show if paid */}
                  {order.paidAt && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Payment Confirmed
                        </p>
                        <p className="text-sm text-gray-500">
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
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Processing
                        </p>
                        <p className="text-sm text-gray-500">
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
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Confirmed
                        </p>
                        <p className="text-sm text-gray-500">
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
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Shipped
                        </p>
                        <p className="text-sm text-gray-500">
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
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Out for Delivery
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.outForDeliveryAt
                            ? formatDate(order.outForDeliveryAt)
                            : formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delivered - Show only if status is Delivered */}
                  {order.orderStatus === "Delivered" && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Delivered
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.deliveredAt
                            ? formatDate(order.deliveredAt)
                            : formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cancelled - Show if status is Cancelled */}
                  {order.orderStatus === "Cancelled" && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Cancelled
                        </p>
                        <p className="text-sm text-gray-500">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {order.user?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {order.user?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {order.shippingInfo?.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900 font-medium">
                    {order.shippingInfo?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingInfo?.address || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingInfo?.city || "N/A"},{" "}
                    {order.shippingInfo?.state || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingInfo?.pincode || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Method:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.paymentInfo?.method || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`text-sm font-medium ${
                        order.paymentInfo?.status === "succeeded"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.paymentInfo?.status || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paid At:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.paidAt ? formatDate(order.paidAt) : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Items Price:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(order.itemsPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(order.taxPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shipping:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.shippingPrice === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(order.shippingPrice || 0)
                      )}
                    </span>
                  </div>
                  {order.coupon && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Coupon Discount:
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        -
                        {formatPrice(
                          order.coupon.discountApplied ||
                            order.coupon.discount ||
                            0
                        )}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {formatPrice(order.totalPrice || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
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
                  onClick={loadOrderDetails}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
