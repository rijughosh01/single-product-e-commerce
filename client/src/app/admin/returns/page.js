"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { returnsAPI } from "@/lib/api";
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";

export default function AdminReturnsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

    loadReturns();
  }, [isAuthenticated, user, router]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const response = await returnsAPI.getAllReturns(params);
      setReturns(response.data.returns);
    } catch (error) {
      console.error("Error loading returns:", error);
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReturns();
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalReturnValue = (returnItems) => {
    return returnItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const filteredReturns = returns.filter((returnRequest) => {
    const matchesSearch =
      searchTerm === "" ||
      returnRequest._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnRequest.order._id
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      returnRequest.user.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white flex items-center justify-center">
        <div className="w-full max-w-6xl px-6 space-y-6">
          <div className="h-10 w-48 bg-orange-100/70 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
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
              {[...Array(2)].map((_, i) => (
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-orange-100/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(250,204,21,0.08),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Back to admin"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Return Management
                </h1>
                <p className="text-gray-600">Manage customer return requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by return ID, order ID, or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusFilter("")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === ""
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {[
                  "pending",
                  "approved",
                  "rejected",
                  "return_shipped",
                  "return_received",
                  "refund_processed",
                  "completed",
                  "cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Returns List */}
        {filteredReturns.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No returns found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus
                ? "No returns match your current filters."
                : "No return requests have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReturns.map((returnRequest, index) => (
              <div
                key={returnRequest._id}
                className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-6 hover:shadow-lg transition-shadow duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Return Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            Return #{returnRequest._id.slice(-8).toUpperCase()}
                          </h3>
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                              returnRequest.status
                            )}`}
                          >
                            {getStatusIcon(returnRequest.status)}
                            <span className="ml-1">
                              {returnRequest.status
                                .replace("_", " ")
                                .toUpperCase()}
                            </span>
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p>
                              <span className="font-medium">Order:</span> #
                              {returnRequest.order._id}
                            </p>
                            <p>
                              <span className="font-medium">Customer:</span>{" "}
                              {returnRequest.user.name}
                            </p>
                          </div>
                          <div>
                            <p>
                              <span className="font-medium">Items:</span>{" "}
                              {returnRequest.returnItems.length}
                            </p>
                            <p>
                              <span className="font-medium">Value:</span>
                              <span className="font-semibold text-orange-600 ml-1">
                                {formatPrice(
                                  getTotalReturnValue(returnRequest.returnItems)
                                )}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Requested: {formatDate(returnRequest.requestedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return Items Preview */}
                  <div className="flex items-center gap-2">
                    {returnRequest.returnItems
                      .slice(0, 3)
                      .map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="w-12 h-12 rounded-lg overflow-hidden shadow-md"
                        >
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
                      ))}
                    {returnRequest.returnItems.length > 3 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600">
                        +{returnRequest.returnItems.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/returns/${returnRequest._id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    <Link
                      href={`/admin/returns/${returnRequest._id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Manage
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
