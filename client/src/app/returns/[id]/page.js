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
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { returnsAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ReturnDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const returnId = params.id;

  const [returnRequest, setReturnRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (returnId) {
      loadReturnDetails();
    }
  }, [isAuthenticated, returnId]);

  const loadReturnDetails = async () => {
    try {
      setLoading(true);
      const response = await returnsAPI.getReturnRequest(returnId);
      setReturnRequest(response.data.returnRequest);
    } catch (error) {
      console.error("Error loading return details:", error);
      toast.error("Failed to load return details");
      router.push("/returns");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReturn = async () => {
    if (!confirm("Are you sure you want to cancel this return request?")) {
      return;
    }

    try {
      setCancelling(true);
      await returnsAPI.cancelReturnRequest(returnId);
      setReturnRequest((prev) => ({
        ...prev,
        status: "cancelled",
        cancelledAt: new Date(),
      }));
      toast.success("Return request cancelled successfully");
    } catch (error) {
      console.error("Error cancelling return:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel return request"
      );
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "return_shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "return_received":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "refund_processed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "return_shipped":
        return <Truck className="h-4 w-4" />;
      case "return_received":
        return <Package className="h-4 w-4" />;
      case "refund_processed":
        return <DollarSign className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return "Your return request is under review. We'll notify you once it's approved.";
      case "approved":
        return "Your return request has been approved. Please ship the items back to us.";
      case "rejected":
        return "Your return request has been rejected. Please contact support for more information.";
      case "return_shipped":
        return "Your return has been shipped back to us. We'll process it once received.";
      case "return_received":
        return "We have received your return. Refund will be processed soon.";
      case "refund_processed":
        return "Your refund has been processed successfully.";
      case "completed":
        return "Your return process has been completed.";
      case "cancelled":
        return "Your return request has been cancelled.";
      default:
        return "Return status unknown.";
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

  const canCancelReturn = () => {
    return returnRequest && returnRequest.status === "pending";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            Loading return details...
          </p>
        </div>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Return not found
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The return request you are looking for does not exist or you do not
            have permission to view it.
          </p>
          <Button
            onClick={() => router.push("/returns")}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            View All Returns
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
                onClick={() => router.push("/returns")}
                className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Returns
              </Button>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">
                  Return Details
                </h1>
                <p className="text-xl text-gray-600">
                  Return #{returnRequest._id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`px-4 py-2 text-sm font-semibold ${getStatusColor(
                  returnRequest.status
                )}`}
              >
                {getStatusIcon(returnRequest.status)}
                <span className="ml-2">
                  {returnRequest.status.replace("_", " ").toUpperCase()}
                </span>
              </Badge>
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 mb-1">Status Update:</p>
                <p className="text-blue-700">
                  {getStatusMessage(returnRequest.status)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Return Items */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">🛒</span>
                  </div>
                  Return Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {returnRequest.returnItems.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-6 p-6 bg-gradient-to-r from-white to-orange-50 border border-orange-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reason:</span>{" "}
                            {item.reason.replace("_", " ").toUpperCase()}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Details:</span>{" "}
                              {item.description}
                            </p>
                          )}
                        </div>
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

            {/* Return Timeline */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📋</span>
                  </div>
                  Return Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Requested */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900">
                        Return Requested
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(returnRequest.requestedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Approved */}
                  {returnRequest.approvedAt && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-green-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Return Approved
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(returnRequest.approvedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rejected */}
                  {returnRequest.rejectedAt && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-red-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Return Rejected
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(returnRequest.rejectedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Return Shipped */}
                  {returnRequest.returnShippedAt && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-purple-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Return Shipped
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(returnRequest.returnShippedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Return Received */}
                  {returnRequest.returnReceivedAt && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-orange-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Return Received
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(returnRequest.returnReceivedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Refund Processed */}
                  {returnRequest.refundInfo &&
                    returnRequest.refundInfo.refundedAt && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-green-600 rounded-full shadow-lg"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900">
                            Refund Processed
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(returnRequest.refundInfo.refundedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Completed */}
                  {returnRequest.completedAt && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-green-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Return Completed
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(returnRequest.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cancelled */}
                  {returnRequest.cancelledAt && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-red-600 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          Return Cancelled
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(returnRequest.cancelledAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-6 self-start">
            {/* Order Information */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📦</span>
                  </div>
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-orange-500" />
                    <span className="text-base font-semibold text-gray-900">
                      Order #{returnRequest.order._id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-500" />
                    <span className="text-base font-medium text-gray-700">
                      {formatPrice(returnRequest.order.totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <span className="text-base font-medium text-gray-700">
                      {formatDate(returnRequest.order.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Address */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">📍</span>
                  </div>
                  Return Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-base text-gray-900 font-semibold">
                    {returnRequest.returnAddress.name}
                  </p>
                  <p className="text-base text-gray-700">
                    {returnRequest.returnAddress.address}
                  </p>
                  <p className="text-base text-gray-700">
                    {returnRequest.returnAddress.city},{" "}
                    {returnRequest.returnAddress.state}
                  </p>
                  <p className="text-base text-gray-700 font-medium">
                    {returnRequest.returnAddress.pincode}
                  </p>
                  <p className="text-base text-gray-700">
                    Phone: {returnRequest.returnAddress.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Return Summary */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">💰</span>
                  </div>
                  Return Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-base">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Items to Return:</span>
                    <span className="font-bold">
                      {returnRequest.returnItems.length}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Return Value:</span>
                    <span className="font-bold text-orange-600">
                      {formatPrice(
                        returnRequest.returnItems.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl">
                    <span className="text-gray-900">Total Refund</span>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {formatPrice(
                        returnRequest.returnItems.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Information */}
            {returnRequest.refundInfo && returnRequest.refundInfo.refundId && (
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
                      <span className="text-base text-gray-600 font-medium">
                        Refund ID:
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {returnRequest.refundInfo.refundId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 font-medium">
                        Amount:
                      </span>
                      <span className="text-base font-semibold text-green-600">
                        {formatPrice(returnRequest.refundInfo.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 font-medium">
                        Status:
                      </span>
                      <Badge
                        className={`px-3 py-1 text-sm font-semibold ${
                          returnRequest.refundInfo.status === "processed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : returnRequest.refundInfo.status === "failed"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }`}
                      >
                        {returnRequest.refundInfo.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 font-medium">
                        Reason:
                      </span>
                      <span className="text-base font-medium text-gray-700">
                        {returnRequest.refundInfo.reason}
                      </span>
                    </div>
                    {returnRequest.refundInfo.refundedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-base text-gray-600 font-medium">
                          Refunded At:
                        </span>
                        <span className="text-base font-medium text-gray-700">
                          {formatDate(returnRequest.refundInfo.refundedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Notes */}
            {returnRequest.adminNotes && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">📝</span>
                    </div>
                    Admin Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-base text-gray-700">
                    {returnRequest.adminNotes}
                  </p>
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
                {canCancelReturn() && (
                  <Button
                    onClick={handleCancelReturn}
                    disabled={cancelling}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    {cancelling ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Cancel Return
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={loadReturnDetails}
                  className="w-full hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
