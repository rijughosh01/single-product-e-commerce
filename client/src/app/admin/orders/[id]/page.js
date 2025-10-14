"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Home,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function AdminOrderDetail() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundDetails, setRefundDetails] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && !["admin", "vendor"].includes(user.role)) {
      toast.error("Access denied. Admin or Vendor privileges required.");
      router.push("/");
      return;
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, user, router, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await adminAPI.getOrderById(orderId);
      setOrder(response.data.order);

      // Fetch refund details if refund exists
      if (
        response.data.order.refundInfo &&
        response.data.order.refundInfo.refundId
      ) {
        try {
          const refundResponse = await adminAPI.getRefundDetails(orderId);
          setRefundDetails(refundResponse.data.refund);
        } catch (refundError) {
          console.warn(
            "Refund details fetch failed (non-critical):",
            refundError
          );
        }
      }
    } catch (error) {
      console.error("Order fetch error:", error);
      toast.error("Failed to load order details");
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await adminAPI.updateOrder(orderId, { orderStatus: newStatus });
      setOrder({ ...order, orderStatus: newStatus });
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Update order error:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleProcessRefund = async () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for refund");
      return;
    }

    try {
      setProcessingRefund(true);
      const response = await adminAPI.processRefund(orderId, {
        amount: refundAmount ? parseFloat(refundAmount) : undefined,
        reason: refundReason,
      });

      // Update order with refund info
      setOrder((prevOrder) => ({
        ...prevOrder,
        orderStatus: "Cancelled",
        cancelledAt: new Date(),
        refundInfo: {
          refundId: response.data.refund.id,
          amount: response.data.refund.amount,
          status: response.data.refund.status,
          reason: response.data.refund.reason,
          refundedAt: new Date(),
        },
      }));

      setRefundDetails(response.data.refund);
      setShowRefundModal(false);
      setRefundAmount("");
      setRefundReason("");

      toast.success("Refund processed successfully");
    } catch (error) {
      console.error("Refund processing error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to process refund";

      if (errorMessage.includes("Refund already exists")) {
        toast.error(
          "A refund has already been processed for this order. Please refresh the page to see the refund details."
        );

        fetchOrderDetails();
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setProcessingRefund(false);
    }
  };

  const canProcessRefund = () => {
    return (
      order &&
      order.paymentInfo.method !== "cod" &&
      order.paymentInfo.status === "completed" &&
      (!order.refundInfo || !order.refundInfo.refundId)
    );
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
        return <XCircle className="h-4 w-4" />;
      case "Returned":
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatINR = (value) => {
    const num = Number.parseFloat(value || 0);
    const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rounded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white flex items-center justify-center">
        <div className="w-full max-w-6xl px-6 space-y-6">
          <div className="h-10 w-48 bg-orange-100/70 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
                  <div className="mt-4 h-28 bg-gray-50 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
                  <div className="mt-4 h-16 bg-gray-50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Order not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The order you are looking for does not exist.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-orange-100/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(250,204,21,0.08),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/orders"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Back to orders"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="text-gray-600">Order #{order._id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/admin/orders/${order._id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Link>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Status
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusIcon(order.orderStatus)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Status
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        getStatusColor(order.orderStatus).split(" ")[1]
                      }`}
                    >
                      {order.orderStatus}
                    </p>
                  </div>
                </div>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  className={`text-sm font-semibold rounded-lg px-3 py-2 border ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  <option value="Processing">Processing</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={
                          typeof item.image === "string"
                            ? item.image
                            : item.image?.url || "/placeholder-ghee.jpg"
                        }
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: {formatINR(item.price)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Timeline
              </h2>
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
                      {new Date(order.createdAt).toLocaleString()}
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
                        {new Date(order.paidAt).toLocaleString()}
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
                          ? new Date(order.paidAt).toLocaleString()
                          : new Date(order.createdAt).toLocaleString()}
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
                          ? new Date(order.paidAt).toLocaleString()
                          : new Date(order.createdAt).toLocaleString()}
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
                          ? new Date(order.shippedAt).toLocaleString()
                          : new Date(order.createdAt).toLocaleString()}
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
                          ? new Date(order.outForDeliveryAt).toLocaleString()
                          : new Date(order.createdAt).toLocaleString()}
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
                          ? new Date(order.deliveredAt).toLocaleString()
                          : new Date(order.createdAt).toLocaleString()}
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
                          ? new Date(order.cancelledAt).toLocaleString()
                          : new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 self-start">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.user?.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.user?.email}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.shippingInfo?.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-900 font-medium">
                  {order.shippingInfo?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingInfo?.address}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingInfo?.city}, {order.shippingInfo?.state}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingInfo?.pincode}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Method:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.paymentInfo?.method}
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
                    {order.paymentInfo?.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Paid At:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.paidAt
                      ? new Date(order.paidAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Refund Information */}
            {order.refundInfo && order.refundInfo.refundId && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Refund Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Refund ID:</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {order.refundInfo.refundId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatINR(order.refundInfo.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        order.refundInfo.status === "processed"
                          ? "bg-green-100 text-green-800"
                          : order.refundInfo.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.refundInfo.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reason:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.refundInfo.reason}
                    </span>
                  </div>
                  {order.refundInfo.refundedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Refunded At:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(order.refundInfo.refundedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {refundDetails && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">
                        Razorpay Details:
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Receipt:</span>
                          <span className="font-mono">
                            {refundDetails.receipt || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>
                            {new Date(
                              refundDetails.created_at * 1000
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items Price:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatINR(order.itemsPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatINR(order.taxPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shipping:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.shippingPrice === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatINR(order.shippingPrice)
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
                      {formatINR(
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
                      {formatINR(order.totalPrice)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-400"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Actions */}
            {canProcessRefund() && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                  Refund Management
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">
                          Refund Information:
                        </p>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>• Refund will be processed through Razorpay</li>
                          <li>• Customer will receive email notification</li>
                          <li>• Order status will be updated to "Cancelled"</li>
                          <li>• Product stock will be restored</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRefundAmount(order.totalPrice.toString());
                      setShowRefundModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Process Refund
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Process Refund
                </h3>
                <p className="text-sm text-gray-600">
                  Refund for Order #{order._id}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={order.totalPrice.toString()}
                  min="0"
                  max={order.totalPrice}
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for full refund (₹{order.totalPrice})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Refund *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please provide a reason for this refund..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {refundReason.length}/500 characters
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Important:</p>
                  <ul className="text-yellow-700 space-y-1 text-xs">
                    <li>• This action cannot be undone</li>
                    <li>• Customer will receive email notification</li>
                    <li>• Order status will be updated to "Cancelled"</li>
                    <li>• Product stock will be restored</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundAmount("");
                  setRefundReason("");
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={processingRefund || !refundReason.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {processingRefund ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <DollarSign className="w-4 h-4" />
                )}
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
