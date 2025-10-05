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
  Edit,
  Save,
} from "lucide-react";
import { returnsAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function AdminReturnDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const returnId = params.id;

  const [returnRequest, setReturnRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

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

    if (returnId) {
      loadReturnDetails();
    }
  }, [isAuthenticated, user, router, returnId]);

  const loadReturnDetails = async () => {
    try {
      setLoading(true);
      const response = await returnsAPI.getReturnRequest(returnId);
      setReturnRequest(response.data.returnRequest);
      setAdminNotes(response.data.returnRequest.adminNotes || "");
    } catch (error) {
      console.error("Error loading return details:", error);
      toast.error("Failed to load return details");
      router.push("/admin/returns");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setUpdating(true);
      await returnsAPI.updateReturnStatus(returnId, {
        status: newStatus,
        adminNotes: adminNotes,
      });

      setReturnRequest((prev) => ({
        ...prev,
        status: newStatus,
        adminNotes: adminNotes,
      }));

      setShowStatusModal(false);
      setNewStatus("");
      toast.success("Return status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for refund");
      return;
    }

    try {
      setUpdating(true);
      const response = await returnsAPI.processReturnRefund(returnId, {
        amount: refundAmount ? parseFloat(refundAmount) : undefined,
        reason: refundReason,
      });

      setReturnRequest((prev) => ({
        ...prev,
        status: "refund_processed",
        refundInfo: {
          refundId: response.data.refund.id,
          amount: response.data.refund.amount,
          status: response.data.refund.status,
          reason: response.data.refund.reason,
          refundedAt: new Date(),
        },
      }));

      setShowRefundModal(false);
      setRefundAmount("");
      setRefundReason("");
      toast.success("Refund processed successfully");
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error(error.response?.data?.message || "Failed to process refund");
    } finally {
      setUpdating(false);
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

  const canProcessRefund = () => {
    return (
      returnRequest &&
      returnRequest.status === "return_received" &&
      returnRequest.order.paymentInfo.method !== "cod" &&
      (!returnRequest.refundInfo || !returnRequest.refundInfo.refundId)
    );
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

  if (!returnRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Return not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The return request you are looking for does not exist.
          </p>
          <Link
            href="/admin/returns"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Returns
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
                href="/admin/returns"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Back to returns"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Return Details
                </h1>
                <p className="text-gray-600">Return #{returnRequest._id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadReturnDetails}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Return Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Return Status
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${getStatusColor(
                      returnRequest.status
                    )}`}
                  >
                    {getStatusIcon(returnRequest.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Status
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        getStatusColor(returnRequest.status).split(" ")[1]
                      }`}
                    >
                      {returnRequest.status.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </button>
              </div>
            </div>

            {/* Return Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Return Items
              </h2>
              <div className="space-y-4">
                {returnRequest.returnItems.map((item, index) => (
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
                        Price: {formatPrice(item.price)} each
                      </p>
                      <p className="text-sm text-gray-500">
                        Reason: {item.reason.replace("_", " ").toUpperCase()}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-500">
                          Details: {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Return Timeline
              </h2>
              <div className="space-y-4">
                {/* Requested */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Return Requested
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(returnRequest.requestedAt)}
                    </p>
                  </div>
                </div>

                {/* Approved */}
                {returnRequest.approvedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Return Approved
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(returnRequest.approvedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejected */}
                {returnRequest.rejectedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Return Rejected
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(returnRequest.rejectedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Return Shipped */}
                {returnRequest.returnShippedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Return Shipped
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(returnRequest.returnShippedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Return Received */}
                {returnRequest.returnReceivedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Return Received
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(returnRequest.returnReceivedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Refund Processed */}
                {returnRequest.refundInfo &&
                  returnRequest.refundInfo.refundedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Refund Processed
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(returnRequest.refundInfo.refundedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Completed */}
                {returnRequest.completedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Return Completed
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(returnRequest.completedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Cancelled */}
                {returnRequest.cancelledAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Return Cancelled
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(returnRequest.cancelledAt)}
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
                    {returnRequest.user.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {returnRequest.user.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order ID:</span>
                  <span className="text-sm font-medium text-gray-900">
                    #{returnRequest.order._id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(returnRequest.order.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {returnRequest.order.paymentInfo.method}
                  </span>
                </div>
              </div>
            </div>

            {/* Return Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Return Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Items to Return:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {returnRequest.returnItems.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Return Value:</span>
                  <span className="text-sm font-medium text-orange-600">
                    {formatPrice(
                      returnRequest.returnItems.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total Refund:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatPrice(
                        returnRequest.returnItems.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Information */}
            {returnRequest.refundInfo && returnRequest.refundInfo.refundId && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Refund Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Refund ID:</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {returnRequest.refundInfo.refundId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatPrice(returnRequest.refundInfo.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        returnRequest.refundInfo.status === "processed"
                          ? "bg-green-100 text-green-800"
                          : returnRequest.refundInfo.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {returnRequest.refundInfo.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reason:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {returnRequest.refundInfo.reason}
                    </span>
                  </div>
                  {returnRequest.refundInfo.refundedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Refunded At:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(returnRequest.refundInfo.refundedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Notes
              </h2>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this return..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={4}
              />
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {updating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  "Update Notes"
                )}
              </button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Update Status
                </button>

                {canProcessRefund() && (
                  <button
                    onClick={() => {
                      setRefundAmount(
                        returnRequest.returnItems
                          .reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          )
                          .toString()
                      );
                      setShowRefundModal(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Process Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Update Return Status
                </h3>
                <p className="text-sm text-gray-600">
                  Return #{returnRequest._id}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="return_shipped">Return Shipped</option>
                  <option value="return_received">Return Received</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this status update..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus("");
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {updating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Process Refund
                </h3>
                <p className="text-sm text-gray-600">
                  Return #{returnRequest._id}
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
                  placeholder={returnRequest.returnItems
                    .reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    )
                    .toString()}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for full refund
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
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
                disabled={updating || !refundReason.trim()}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {updating ? (
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
