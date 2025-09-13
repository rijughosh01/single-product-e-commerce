"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  Package,
  User,
  Play,
  Pause,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { subscriptionsAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AdminSubscriptionsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
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

    fetchSubscriptions();
  }, [isAuthenticated, user, router]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await subscriptionsAPI.getAllSubscriptions();
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = async (subscriptionId) => {
    try {
      await subscriptionsAPI.pauseSubscription(subscriptionId);
      toast.success("Subscription paused");
      fetchSubscriptions();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to pause subscription";
      toast.error(message);
    }
  };

  const handleResumeSubscription = async (subscriptionId) => {
    try {
      await subscriptionsAPI.resumeSubscription(subscriptionId);
      toast.success("Subscription resumed");
      fetchSubscriptions();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to resume subscription";
      toast.error(message);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }
    try {
      await subscriptionsAPI.cancelSubscription(subscriptionId);
      toast.success("Subscription cancelled");
      fetchSubscriptions();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel subscription";
      toast.error(message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "biweekly":
        return "Bi-weekly";
      case "monthly":
        return "Monthly";
      default:
        return frequency;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.product?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Subscription Management</h2>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Subscriptions List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading subscriptions...</span>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subscriptions found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "No subscriptions match your search criteria"
                  : "No subscriptions have been created yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5" />
                      <div>
                        <CardTitle className="text-lg">
                          {subscription.product?.name || "Product"}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {subscription.quantity} ×{" "}
                          {getFrequencyText(subscription.frequency)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status.charAt(0).toUpperCase() +
                        subscription.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {subscription.user?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {subscription.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Next Delivery</p>
                        <p className="text-sm text-gray-600">
                          {subscription.status === "active"
                            ? formatDate(
                                new Date(subscription.nextDeliveryDate)
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Total Deliveries</p>
                        <p className="text-sm text-gray-600">
                          {subscription.deliveryCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {subscription.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePauseSubscription(subscription._id)
                        }
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    {subscription.status === "paused" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleResumeSubscription(subscription._id)
                        }
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    {subscription.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCancelSubscription(subscription._id)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
