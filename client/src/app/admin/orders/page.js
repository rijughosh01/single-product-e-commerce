"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Edit,
  Calendar,
  MapPin,
  Phone,
  Package,
  CreditCard,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowUpDown,
  Download,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function AdminOrders() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

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

    fetchOrders();
  }, [isAuthenticated, user, router]);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await adminAPI.getAllOrders();
      setOrders(response.data.orders || []);

      if (isRefresh) {
        toast.success("Orders refreshed successfully");
      }
    } catch (error) {
      console.error("Orders fetch error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrder(orderId, { orderStatus: newStatus });
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Update order error:", error);
      toast.error("Failed to update order status");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      Processing: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        dot: "bg-amber-500",
      },
      Confirmed: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle,
        dot: "bg-blue-500",
      },
      Shipped: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Truck,
        dot: "bg-purple-500",
      },
      "Out for Delivery": {
        color: "bg-orange-50 text-orange-700 border-orange-200",
        icon: Truck,
        dot: "bg-orange-500",
      },
      Delivered: {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        dot: "bg-green-500",
      },
      Cancelled: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        dot: "bg-red-500",
      },
      Returned: {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: RefreshCw,
        dot: "bg-gray-500",
      },
    };
    return configs[status] || configs.Processing;
  };

  const formatAddress = (shippingInfo) => {
    return `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.pincode}`;
  };

  const formatOrderId = (id) => {
    return `#${id.slice(-8).toUpperCase()}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const matchesSearch =
        (order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || order.orderStatus === filterStatus;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "amount-high":
          return b.totalPrice - a.totalPrice;
        case "amount-low":
          return a.totalPrice - b.totalPrice;
        default:
          return 0;
      }
    });

  const OrderCard = ({ order }) => {
    const statusConfig = getStatusConfig(order.orderStatus);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200 group">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {formatOrderId(order._id)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2 flex-wrap">
                <div
                  className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                >
                  <div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${statusConfig.dot}`}
                  ></div>
                  <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  <span className="hidden sm:inline">{order.orderStatus}</span>
                  <span className="sm:hidden">
                    {order.orderStatus.split(" ")[0]}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {order.orderItems.length} item
                  {order.orderItems.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="text-right ml-3 flex-shrink-0">
              <div className="text-base sm:text-lg font-bold text-gray-900">
                {formatPrice(order.totalPrice)}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                {order.user?.name || "Unknown User"}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {order.user?.email || "N/A"}
              </p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{order.shippingInfo.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h5 className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                Shipping Address
              </h5>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                <span className="font-medium">{order.shippingInfo.name}</span>
                <br />
                <span className="break-words">
                  {formatAddress(order.shippingInfo)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 capitalize truncate">
                  {order.paymentInfo.method}
                </p>
                <p
                  className={`text-xs ${
                    order.paymentInfo.status === "succeeded"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {order.paymentInfo.status}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Link
                href={`/admin/orders/${order._id}`}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
              <Link
                href={`/admin/orders/${order._id}/edit`}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit Order"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
              <div className="relative">
                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    handleStatusUpdate(order._id, e.target.value)
                  }
                  className="appearance-none bg-transparent border-0 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer pr-4 sm:pr-6 focus:outline-none"
                >
                  <option value="Processing">Processing</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-8 pb-6 sm:pb-8">
      {/* Header Section */}
      <div className="mt-3 sm:mt-5 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Order Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Monitor and manage customer orders efficiently
            </p>
          </div>

          <div className="flex items-center justify-between lg:justify-end space-x-3 lg:space-x-4">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 sm:px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {filteredAndSortedOrders.length} Orders
              </span>
            </div>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className={`p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${
                refreshing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              >
                <option value="all">All Orders</option>
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mx-2 sm:mx-4 lg:mx-8">
        {filteredAndSortedOrders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedOrders.length === 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center mx-2 sm:mx-4 lg:mx-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No orders have been placed yet."}
          </p>
          {(searchTerm || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
