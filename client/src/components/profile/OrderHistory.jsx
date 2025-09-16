"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Eye,
  Download,
  Calendar,
  MapPin,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { ordersAPI } from "@/lib/api";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await ordersAPI.getOrders();
      if (data?.success) setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await ordersAPI.getOrderInvoice(orderId);
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Invoice downloaded successfully!");
      } else {
        toast.error("Failed to download invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const { data } = await ordersAPI.cancelOrder(orderId);

      if (data?.success) {
        toast.success("Order cancelled successfully!");
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
          <p className="text-sm text-gray-600">
            View and manage your past orders
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't placed any orders yet
          </p>
          <Button
            onClick={() => (window.location.href = "/products")}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Start Shopping
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <Badge className={getStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4" />
                      <span>
                        {order.orderItems.length} item
                        {order.orderItems.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">
                        ₹{order.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(order._id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Invoice
                  </Button>
                  {order.orderStatus.toLowerCase() === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img
                        src={
                          typeof item.image === "string"
                            ? item.image
                            : item.image?.url || "/placeholder-ghee.jpg"
                        }
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      +{order.orderItems.length - 3} more items
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingInfo && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">
                        {order.shippingInfo.name}
                      </p>
                      <p>{order.shippingInfo.address}</p>
                      <p>
                        {order.shippingInfo.city}, {order.shippingInfo.state} -{" "}
                        {order.shippingInfo.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Order Details - #{selectedOrder._id.slice(-8).toUpperCase()}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                {/* Order Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <Badge className={getStatusColor(selectedOrder.orderStatus)}>
                    {selectedOrder.orderStatus}
                  </Badge>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                      >
                        <img
                          src={
                            typeof item.image === "string"
                              ? item.image
                              : item.image?.url || "/placeholder-ghee.jpg"
                          }
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: ₹{item.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ₹{(item.quantity * item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Order Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{selectedOrder.itemsPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>
                        ₹{selectedOrder.shippingPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>₹{selectedOrder.taxPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>₹{selectedOrder.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedOrder.paymentInfo && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Payment Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span>{selectedOrder.paymentInfo.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status</span>
                        <Badge
                          className={getStatusColor(
                            selectedOrder.paymentInfo.status
                          )}
                        >
                          {selectedOrder.paymentInfo.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
