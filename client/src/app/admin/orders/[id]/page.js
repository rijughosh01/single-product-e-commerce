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
} from "lucide-react";
import Link from "next/link";

export default function AdminOrderDetail() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/orders"
                className="text-gray-600 hover:text-gray-900 transition-colors"
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
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
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
                        src={item.image || "/placeholder-ghee.jpg"}
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
                        Price: ₹{item.price} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
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
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.user.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.user.email}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.shippingInfo.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-900 font-medium">
                  {order.shippingInfo.name}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingInfo.address}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingInfo.city}, {order.shippingInfo.state}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingInfo.pincode}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Method:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.paymentInfo.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`text-sm font-medium ${
                      order.paymentInfo.status === "succeeded"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.paymentInfo.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Paid At:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(order.paidAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items Price:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{order.itemsPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{order.taxPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shipping:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.shippingPrice === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${order.shippingPrice}`
                    )}
                  </span>
                </div>
                {order.coupon && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Coupon Discount:
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      -₹
                      {order.coupon.discountApplied ||
                        order.coupon.discount ||
                        0}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      ₹{order.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
