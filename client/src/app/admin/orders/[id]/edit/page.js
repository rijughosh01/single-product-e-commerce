"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
} from "lucide-react";
import Link from "next/link";

export default function AdminOrderEdit() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    orderStatus: "",
    shippingInfo: {
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

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
      const orderData = response.data.order;
      setOrder(orderData);
      setFormData({
        orderStatus: orderData.orderStatus,
        shippingInfo: {
          name: orderData.shippingInfo.name,
          phone: orderData.shippingInfo.phone,
          address: orderData.shippingInfo.address,
          city: orderData.shippingInfo.city,
          state: orderData.shippingInfo.state,
          pincode: orderData.shippingInfo.pincode,
        },
      });
    } catch (error) {
      console.error("Order fetch error:", error);
      toast.error("Failed to load order details");
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("shippingInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        shippingInfo: {
          ...prev.shippingInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await adminAPI.updateOrder(orderId, formData);
      toast.success("Order updated successfully");
      router.push(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error("Update order error:", error);
      toast.error("Failed to update order");
    } finally {
      setSaving(false);
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
                href={`/admin/orders/${orderId}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Order</h1>
                <p className="text-gray-600">Order #{order._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Status
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                  </label>
                  <select
                    name="orderStatus"
                    value={formData.orderStatus}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(
                      formData.orderStatus
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
            </div>

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
                    {order.user?.name || "Unknown User"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.user?.email || "N/A"}
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
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="shippingInfo.name"
                  value={formData.shippingInfo.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="shippingInfo.phone"
                  value={formData.shippingInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="shippingInfo.address"
                  value={formData.shippingInfo.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="shippingInfo.city"
                  value={formData.shippingInfo.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="shippingInfo.state"
                  value={formData.shippingInfo.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="shippingInfo.pincode"
                  value={formData.shippingInfo.pincode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Order Items (Read-only) */}
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

          {/* Order Summary (Read-only) */}
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
                  ₹{order.shippingPrice}
                </span>
              </div>
              {order.coupon && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Coupon Discount:
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    -₹
                    {order.coupon.discountApplied || order.coupon.discount || 0}
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/admin/orders/${orderId}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
