"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
} from "lucide-react";
import { ordersAPI, returnsAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const RETURN_REASONS = [
  { value: "defective_product", label: "Defective Product" },
  { value: "wrong_item", label: "Wrong Item Received" },
  { value: "not_as_described", label: "Not as Described" },
  { value: "damaged_during_shipping", label: "Damaged During Shipping" },
  { value: "changed_mind", label: "Changed Mind" },
  { value: "other", label: "Other" },
];

export default function ReturnRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnAddress, setReturnAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!orderId) {
      router.push("/orders");
      return;
    }

    loadOrderDetails();
  }, [isAuthenticated, orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrderById(orderId);
      const orderData = response.data.order;

      // Check if order is delivered
      if (orderData.orderStatus !== "Delivered") {
        toast.error("Only delivered orders can be returned");
        router.push(`/orders/${orderId}`);
        return;
      }

      // Check return window 7 days
      const daysSinceDelivery = Math.floor(
        (Date.now() - new Date(orderData.deliveredAt)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceDelivery > 7) {
        toast.error(
          "Return window has expired. Returns must be requested within 7 days of delivery"
        );
        router.push(`/orders/${orderId}`);
        return;
      }

      setOrder(orderData);

      // Pre-fill return address with user's default address
      if (user && user.addresses && user.addresses.length > 0) {
        const defaultAddress =
          user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
        setReturnAddress({
          name: defaultAddress.name || user.name,
          address: defaultAddress.address || "",
          city: defaultAddress.city || "",
          state: defaultAddress.state || "",
          pincode: defaultAddress.pincode || "",
          phone: defaultAddress.phone || "",
        });
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load order details");
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (item, isSelected) => {
    if (isSelected) {
      setSelectedItems((prev) => [
        ...prev,
        {
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          reason: "",
          description: "",
        },
      ]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((selectedItem) => selectedItem.product !== item.product)
      );
    }
  };

  const handleItemReasonChange = (productId, reason) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.product === productId ? { ...item, reason } : item
      )
    );
  };

  const handleItemDescriptionChange = (productId, description) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.product === productId ? { ...item, description } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    if (!returnReason.trim()) {
      toast.error("Please provide a reason for return");
      return;
    }

    // Validate selected items
    for (const item of selectedItems) {
      if (!item.reason) {
        toast.error(`Please select a reason for ${item.name}`);
        return;
      }
    }

    // Validate return address
    const requiredFields = [
      "name",
      "address",
      "city",
      "state",
      "pincode",
      "phone",
    ];
    for (const field of requiredFields) {
      if (!returnAddress[field].trim()) {
        toast.error(`Please fill in the ${field} field`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const response = await returnsAPI.createReturnRequest({
        orderId,
        returnItems: selectedItems,
        returnReason,
        returnAddress,
      });

      toast.success("Return request submitted successfully");
      router.push(`/returns/${response.data.returnRequest._id}`);
    } catch (error) {
      console.error("Error submitting return request:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit return request"
      );
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/orders/${orderId}`)}
              className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Order
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Request Return
              </h1>
              <p className="text-xl text-gray-600">Order #{order._id}</p>
            </div>
          </div>

          {/* Return Window Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Return Policy:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Returns must be requested within 7 days of delivery</li>
                  <li>• Items must be in original condition with tags</li>
                  <li>• Refund will be processed after we receive the items</li>
                  <li>• Return shipping will be arranged by us</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">🛒</span>
                  </div>
                  Select Items to Return
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {order.orderItems.map((item, index) => {
                    const isSelected = selectedItems.some(
                      (selected) => selected.product === item.product
                    );
                    const selectedItem = selectedItems.find(
                      (selected) => selected.product === item.product
                    );

                    return (
                      <div
                        key={index}
                        className={`p-5 border-2 rounded-xl transition-all duration-300 ${
                          isSelected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 bg-white hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleItemSelection(item, e.target.checked)
                              }
                              className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              <img
                                src={
                                  typeof item.image === "string"
                                    ? item.image
                                    : item.image?.url || "/placeholder-ghee.jpg"
                                }
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 break-words mb-2">
                                  {item.name}
                                </h3>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity} ×{" "}
                                    {formatPrice(item.price)}
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    Total:{" "}
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="mt-6 space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for return *
                                  </label>
                                  <select
                                    value={selectedItem?.reason || ""}
                                    onChange={(e) =>
                                      handleItemReasonChange(
                                        item.product,
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                  >
                                    <option value="">Select a reason</option>
                                    {RETURN_REASONS.map((reason) => (
                                      <option
                                        key={reason.value}
                                        value={reason.value}
                                      >
                                        {reason.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional details (optional)
                                  </label>
                                  <textarea
                                    value={selectedItem?.description || ""}
                                    onChange={(e) =>
                                      handleItemDescriptionChange(
                                        item.product,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Please provide more details about the issue..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                                    rows={3}
                                    maxLength={500}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {selectedItem?.description?.length || 0}/500
                                    characters
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Return Reason */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📝</span>
                  </div>
                  Return Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Overall reason for return *
                    </label>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Please describe why you want to return this order..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                      rows={5}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {returnReason.length}/1000 characters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Order Summary */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📋</span>
                  </div>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium text-right">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivered:</span>
                    <span className="font-medium text-right">
                      {formatDate(order.deliveredAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-right">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selected Items:</span>
                      <span className="font-medium">
                        {selectedItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Return Value:</span>
                      <span className="font-bold text-orange-600">
                        {formatPrice(
                          selectedItems.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Address */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📍</span>
                  </div>
                  Return Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={returnAddress.name}
                      onChange={(e) =>
                        setReturnAddress((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      value={returnAddress.address}
                      onChange={(e) =>
                        setReturnAddress((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                      rows={3}
                      placeholder="Enter your complete address"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={returnAddress.city}
                        onChange={(e) =>
                          setReturnAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="Enter city name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={returnAddress.state}
                        onChange={(e) =>
                          setReturnAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="Enter state name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={returnAddress.pincode}
                        onChange={(e) =>
                          setReturnAddress((prev) => ({
                            ...prev,
                            pincode: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="Enter pincode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="text"
                        value={returnAddress.phone}
                        onChange={(e) =>
                          setReturnAddress((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* COD Notice */}
            {order && order.paymentInfo.method === "cod" && (
              <Card className="shadow-xl border-0 bg-blue-50/80 backdrop-blur-sm border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-blue-900 mb-3 text-base">
                        COD Order Refund Information
                      </h3>
                      <p className="text-blue-700 text-sm mb-4 leading-relaxed">
                        Since this is a Cash on Delivery order, your refund will
                        be processed manually. Please ensure your bank details
                        are up to date in your profile for faster refund
                        processing.
                      </p>
                      <div className="space-y-3">
                        <Button
                          onClick={() =>
                            router.push("/profile?tab=bank-details")
                          }
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full"
                        >
                          Update Bank Details
                        </Button>
                        <p className="text-xs text-blue-600 text-center">
                          Refunds typically take 1-3 business days
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  selectedItems.length === 0 ||
                  !returnReason.trim()
                }
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Submit Return Request
                  </div>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                By submitting, you agree to our return policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
