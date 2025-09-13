"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Package,
  Pause,
  Play,
  X,
  Plus,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { subscriptionsAPI } from "@/lib/api";
import { toast } from "sonner";

const SubscriptionManager = ({ className = "" }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    productId: "",
    quantity: 1,
    frequency: "weekly",
    deliveryDay: "",
    startDate: "",
    addressId: "",
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await subscriptionsAPI.getSubscriptions();
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await subscriptionsAPI.createSubscription(newSubscription);
      toast.success("Subscription created successfully!");
      setShowCreateForm(false);
      setNewSubscription({
        productId: "",
        quantity: 1,
        frequency: "weekly",
        deliveryDay: "",
        startDate: "",
        addressId: "",
      });
      fetchSubscriptions();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create subscription";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const pauseSubscription = async (subscriptionId) => {
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

  const resumeSubscription = async (subscriptionId) => {
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

  const cancelSubscription = async (subscriptionId) => {
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
      month: "long",
      day: "numeric",
    });
  };

  const getNextDeliveryDate = (subscription) => {
    if (subscription.status !== "active") return "N/A";

    const lastDelivery = new Date(subscription.lastDeliveryDate);
    const frequency = subscription.frequency;

    let nextDelivery = new Date(lastDelivery);
    switch (frequency) {
      case "weekly":
        nextDelivery.setDate(nextDelivery.getDate() + 7);
        break;
      case "biweekly":
        nextDelivery.setDate(nextDelivery.getDate() + 14);
        break;
      case "monthly":
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        break;
    }

    return formatDate(nextDelivery);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Subscription
        </Button>
      </div>

      {/* Create Subscription Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSubscription} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product ID
                  </label>
                  <Input
                    value={newSubscription.productId}
                    onChange={(e) =>
                      setNewSubscription((prev) => ({
                        ...prev,
                        productId: e.target.value,
                      }))
                    }
                    placeholder="Enter product ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={newSubscription.quantity}
                    onChange={(e) =>
                      setNewSubscription((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frequency
                  </label>
                  <select
                    value={newSubscription.frequency}
                    onChange={(e) =>
                      setNewSubscription((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={newSubscription.startDate}
                    onChange={(e) =>
                      setNewSubscription((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Subscription"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading subscriptions...</span>
        </div>
      ) : subscriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No subscriptions yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first subscription to get regular deliveries
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
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
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Next Delivery</p>
                      <p className="text-sm text-gray-600">
                        {getNextDeliveryDate(subscription)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Last Delivery</p>
                      <p className="text-sm text-gray-600">
                        {subscription.lastDeliveryDate
                          ? formatDate(subscription.lastDeliveryDate)
                          : "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
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
                      onClick={() => pauseSubscription(subscription._id)}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  {subscription.status === "paused" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resumeSubscription(subscription._id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  {subscription.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelSubscription(subscription._id)}
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
  );
};

export default SubscriptionManager;
