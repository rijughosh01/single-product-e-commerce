"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Search,
  Filter,
  Calendar,
  CreditCard,
  MapPin,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react";
import { ordersAPI, invoiceAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoice(orderId);

      let invoiceId = null;

      // Check if order has an existing invoice
      const order = orders.find((o) => o._id === orderId);
      if (order?.invoice) {
        invoiceId = order.invoice;
      } else {
        const generateResponse = await invoiceAPI.generateInvoice(orderId);
        invoiceId = generateResponse.data.invoice._id;

        // Update the order in state with the new invoice ID
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === orderId ? { ...o, invoice: invoiceId } : o
          )
        );
      }

      const response = await invoiceAPI.downloadInvoicePDF(invoiceId);

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
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
      setDownloadingInvoice(null);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderItems.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "amount_desc":
        return (b.totalPrice || 0) - (a.totalPrice || 0);
      case "amount_asc":
        return (a.totalPrice || 0) - (b.totalPrice || 0);
      case "date_desc":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const renderSkeletons = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="h-1 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(250,204,21,0.08),transparent_40%)]" />
            <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  My Orders
                </h1>
                <p className="mt-1 text-gray-600">
                  Track and manage your orders
                </p>
              </div>
              <div className="grid grid-cols-3 divide-x rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="p-4">
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-lg font-semibold">{orders.length}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500">Delivered</p>
                  <p className="text-lg font-semibold text-green-600">
                    {orders.filter((o) => o.orderStatus === "Delivered").length}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {
                      orders.filter((o) =>
                        [
                          "Processing",
                          "Confirmed",
                          "Shipped",
                          "Out for Delivery",
                        ].includes(o.orderStatus)
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders by ID or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white/80 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white/80 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white/80 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="amount_desc">Amount: high to low</option>
                <option value="amount_asc">Amount: low to high</option>
              </select>
              <Button variant="outline" onClick={loadOrders} disabled={loading}>
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "all",
              "Processing",
              "Confirmed",
              "Shipped",
              "Out for Delivery",
              "Delivered",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors hover:shadow-sm ${
                  statusFilter === s
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          renderSkeletons()
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {orders.length === 0
                ? "No orders found"
                : "No orders match your search"}
            </h3>
            <p className="text-gray-500 mb-6">
              {orders.length === 0
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : "Try adjusting your search criteria or filters."}
            </p>
            {orders.length === 0 && (
              <Button onClick={() => router.push("/products")}>
                Start Shopping
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {sortedOrders.map((order) => (
              <Card
                key={order._id}
                className="hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 rounded-2xl"
              >
                <CardContent className="p-0">
                  <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order._id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <Badge
                            className={`${getStatusColor(
                              order.orderStatus
                            )} border px-2.5 py-0.5 rounded-full`}
                          >
                            {order.orderStatus}
                          </Badge>
                        </div>

                        {/* Order Items Preview */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {order.orderItems.length} item
                              {order.orderItems.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {order.orderItems.slice(0, 3).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden">
                                  <img
                                    src={
                                      typeof item.image === "string"
                                        ? item.image
                                        : item.image?.url ||
                                          "/placeholder-ghee.jpg"
                                    }
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-sm text-gray-700">
                                  <p className="leading-4 line-clamp-1">
                                    {item.name}
                                  </p>
                                  <p className="text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.orderItems.length > 3 && (
                              <div className="text-sm text-gray-500 self-center">
                                +{order.orderItems.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            <span>{order.paymentInfo?.method || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{order.shippingInfo?.city || "N/A"}</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatPrice(order.totalPrice)}
                          </div>
                        </div>
                        <div className="mt-3">
                          {(() => {
                            const steps = [
                              "Processing",
                              "Confirmed",
                              "Shipped",
                              "Out for Delivery",
                              "Delivered",
                            ];
                            const current = Math.max(
                              0,
                              steps.indexOf(order.orderStatus)
                            );
                            const pct = ((current + 1) / steps.length) * 100;
                            return (
                              <div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all"
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  {order.orderStatus}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/orders/${order._id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(order._id)}
                          disabled={downloadingInvoice === order._id}
                        >
                          {downloadingInvoice === order._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
