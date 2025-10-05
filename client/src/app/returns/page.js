"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  RefreshCw,
  Plus,
  Calendar,
} from "lucide-react";
import { returnsAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ReturnsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    loadReturns();
  }, [isAuthenticated]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const response = await returnsAPI.getMyReturns();
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
        return "Under review";
      case "approved":
        return "Approved - Ship items back";
      case "rejected":
        return "Rejected";
      case "return_shipped":
        return "Return shipped to us";
      case "return_received":
        return "Received - Processing refund";
      case "refund_processed":
        return "Refund processed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown status";
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

  const getTotalReturnValue = (returnItems) => {
    return returnItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            Loading your returns...
          </p>
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
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                My Returns
              </h1>
              <p className="text-xl text-gray-600">
                Track and manage your return requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
              >
                {refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {/* Return Policy Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Return Policy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <p className="font-medium mb-1">Return Window:</p>
                    <p>7 days from delivery date</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Condition:</p>
                    <p>Items must be in original condition</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Refund:</p>
                    <p>Processed after we receive items</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Shipping:</p>
                    <p>Return shipping arranged by us</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Returns List */}
        {returns.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Returns Yet
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              You have not requested any returns yet. When you do, they will
              appear here.
            </p>
            <Button
              onClick={() => router.push("/orders")}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View My Orders
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {returns.map((returnRequest, index) => (
              <Card
                key={returnRequest._id}
                className="group shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Return Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <Package className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                              Return #
                              {returnRequest._id.slice(-8).toUpperCase()}
                            </h3>
                            <Badge
                              className={`px-3 py-1 text-sm font-semibold ${getStatusColor(
                                returnRequest.status
                              )}`}
                            >
                              {getStatusIcon(returnRequest.status)}
                              <span className="ml-1">
                                {returnRequest.status
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">
                            Order #{returnRequest.order._id} •{" "}
                            {returnRequest.returnItems.length} item(s)
                          </p>
                          <p className="text-sm text-gray-500 mb-3">
                            {getStatusMessage(returnRequest.status)}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Requested:{" "}
                                {formatDate(returnRequest.requestedAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold text-orange-600">
                                {formatPrice(
                                  getTotalReturnValue(returnRequest.returnItems)
                                )}
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

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() =>
                          router.push(`/returns/${returnRequest._id}`)
                        }
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 group-hover:shadow-lg"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {returns.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Need Help with Returns?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                If you have any questions about your returns or need assistance,
                please do not hesitate to contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/contact")}
                  variant="outline"
                  className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
                >
                  Contact Support
                </Button>
                <Button
                  onClick={() => router.push("/orders")}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  View All Orders
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
