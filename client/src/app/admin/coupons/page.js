"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Loader2,
  AlertCircle,
  X,
  Tag,
  Settings,
} from "lucide-react";
import { couponsAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

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

    fetchCoupons();
  }, [isAuthenticated, user, router]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponsAPI.getCoupons();
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Transform the form data to match server expectations
      const couponData = {
        code: newCoupon.code,
        description: newCoupon.description || `Coupon ${newCoupon.code}`,
        discountType: newCoupon.type,
        discountValue: newCoupon.value,
        minimumOrderAmount: newCoupon.minOrderAmount,
        maximumDiscount: newCoupon.maxDiscount,
        usageLimit: newCoupon.usageLimit,
        validFrom: newCoupon.validFrom,
        validUntil: newCoupon.validUntil,
        isActive: newCoupon.isActive,
      };

      await couponsAPI.createCoupon(couponData);
      toast.success("Coupon created successfully!");
      setShowCreateForm(false);
      setNewCoupon({
        code: "",
        description: "",
        type: "percentage",
        value: 0,
        minOrderAmount: 0,
        maxDiscount: 0,
        usageLimit: 0,
        validFrom: "",
        validUntil: "",
        isActive: true,
      });
      fetchCoupons();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create coupon";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Transform the form data to match server expectations
      const couponData = {
        code: editingCoupon.code,
        description:
          editingCoupon.description || `Coupon ${editingCoupon.code}`,
        discountType: editingCoupon.type,
        discountValue: editingCoupon.value,
        minimumOrderAmount: editingCoupon.minOrderAmount,
        maximumDiscount: editingCoupon.maxDiscount,
        usageLimit: editingCoupon.usageLimit,
        validFrom: editingCoupon.validFrom,
        validUntil: editingCoupon.validUntil,
        isActive: editingCoupon.isActive,
      };

      await couponsAPI.updateCoupon(editingCoupon._id, couponData);
      toast.success("Coupon updated successfully!");
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update coupon";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }
    try {
      await couponsAPI.deleteCoupon(couponId);
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete coupon";
      toast.error(message);
    }
  };

  const getStatusColor = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return "bg-gray-100 text-gray-800";
    } else if (now < validFrom) {
      return "bg-blue-100 text-blue-800";
    } else if (now > validUntil) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-green-100 text-green-800";
    }
  };

  const getStatusText = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return "Inactive";
    } else if (now < validFrom) {
      return "Scheduled";
    } else if (now > validUntil) {
      return "Expired";
    } else {
      return "Active";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading coupons...</span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No coupons found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "No coupons match your search criteria"
                  : "Create your first coupon to get started"}
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <Card key={coupon._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{coupon.code}</CardTitle>
                    <Badge className={getStatusColor(coupon)}>
                      {getStatusText(coupon)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {coupon.discountType === "percentage" ? (
                        <Percent className="w-4 h-4 text-green-600" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="font-medium">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% off`
                          : `₹${coupon.discountValue} off`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatDate(coupon.validFrom)} -{" "}
                        {formatDate(coupon.validUntil)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Used: {coupon.usedCount || 0} /{" "}
                        {coupon.usageLimit || "∞"}
                      </span>
                    </div>

                    {coupon.minimumOrderAmount > 0 && (
                      <div className="text-sm text-gray-600">
                        Min order: ₹{coupon.minimumOrderAmount}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingCoupon({
                            ...coupon,
                            type: coupon.discountType,
                            value: coupon.discountValue,
                            minOrderAmount: coupon.minimumOrderAmount,
                            maxDiscount: coupon.maximumDiscount,
                          })
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Coupon Modal */}
        {(showCreateForm || editingCoupon) && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">
                      {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingCoupon(null);
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form
                    onSubmit={
                      editingCoupon ? handleUpdateCoupon : handleCreateCoupon
                    }
                    className="space-y-6"
                  >
                    {/* Basic Information Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-amber-600" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Coupon Code *
                          </label>
                          <Input
                            value={
                              editingCoupon
                                ? editingCoupon.code
                                : newCoupon.code
                            }
                            onChange={(e) => {
                              if (editingCoupon) {
                                setEditingCoupon((prev) => ({
                                  ...prev,
                                  code: e.target.value.toUpperCase(),
                                }));
                              } else {
                                setNewCoupon((prev) => ({
                                  ...prev,
                                  code: e.target.value.toUpperCase(),
                                }));
                              }
                            }}
                            placeholder="e.g., WELCOME50"
                            className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                          </label>
                          <Input
                            value={
                              editingCoupon
                                ? editingCoupon.description
                                : newCoupon.description
                            }
                            onChange={(e) => {
                              if (editingCoupon) {
                                setEditingCoupon((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }));
                              } else {
                                setNewCoupon((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }));
                              }
                            }}
                            placeholder="e.g., 50% off for new customers"
                            className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Discount Configuration Section */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Percent className="w-5 h-5 mr-2 text-blue-600" />
                        Discount Configuration
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount Type *
                          </label>
                          <select
                            value={
                              editingCoupon
                                ? editingCoupon.type
                                : newCoupon.type
                            }
                            onChange={(e) => {
                              if (editingCoupon) {
                                setEditingCoupon((prev) => ({
                                  ...prev,
                                  type: e.target.value,
                                }));
                              } else {
                                setNewCoupon((prev) => ({
                                  ...prev,
                                  type: e.target.value,
                                }));
                              }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-md focus:border-amber-500 focus:ring-amber-500 bg-white"
                            required
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {editingCoupon
                              ? editingCoupon.type === "percentage"
                                ? "Discount Percentage *"
                                : "Discount Amount (₹) *"
                              : newCoupon.type === "percentage"
                              ? "Discount Percentage *"
                              : "Discount Amount (₹) *"}
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step={
                                editingCoupon
                                  ? editingCoupon.type === "percentage"
                                    ? "0.01"
                                    : "1"
                                  : newCoupon.type === "percentage"
                                  ? "0.01"
                                  : "1"
                              }
                              value={
                                editingCoupon
                                  ? editingCoupon.value
                                  : newCoupon.value
                              }
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value) || 0;
                                if (editingCoupon) {
                                  setEditingCoupon((prev) => ({
                                    ...prev,
                                    value: value,
                                  }));
                                } else {
                                  setNewCoupon((prev) => ({
                                    ...prev,
                                    value: value,
                                  }));
                                }
                              }}
                              placeholder={
                                editingCoupon
                                  ? editingCoupon.type === "percentage"
                                    ? "e.g., 20"
                                    : "e.g., 100"
                                  : newCoupon.type === "percentage"
                                  ? "e.g., 20"
                                  : "e.g., 100"
                              }
                              className="border-gray-300 focus:border-amber-500 focus:ring-amber-500 pr-8"
                              required
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              {editingCoupon
                                ? editingCoupon.type === "percentage"
                                  ? "%"
                                  : "₹"
                                : newCoupon.type === "percentage"
                                ? "%"
                                : "₹"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Usage Rules Section */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-600" />
                        Usage Rules
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Order Amount (₹)
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                editingCoupon
                                  ? editingCoupon.minOrderAmount
                                  : newCoupon.minOrderAmount
                              }
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value) || 0;
                                if (editingCoupon) {
                                  setEditingCoupon((prev) => ({
                                    ...prev,
                                    minOrderAmount: value,
                                  }));
                                } else {
                                  setNewCoupon((prev) => ({
                                    ...prev,
                                    minOrderAmount: value,
                                  }));
                                }
                              }}
                              placeholder="e.g., 500"
                              className="border-gray-300 focus:border-amber-500 focus:ring-amber-500 pr-8"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              ₹
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Minimum order value required to use this coupon
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Usage Limit
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={
                              editingCoupon
                                ? editingCoupon.usageLimit
                                : newCoupon.usageLimit
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value) || 0;
                              if (editingCoupon) {
                                setEditingCoupon((prev) => ({
                                  ...prev,
                                  usageLimit: value,
                                }));
                              } else {
                                setNewCoupon((prev) => ({
                                  ...prev,
                                  usageLimit: value,
                                }));
                              }
                            }}
                            placeholder="e.g., 100"
                            className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum number of times this coupon can be used (0 =
                            unlimited)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Validity Period Section */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                        Validity Period
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valid From *
                          </label>
                          <Input
                            type="date"
                            value={
                              editingCoupon
                                ? editingCoupon.validFrom
                                : newCoupon.validFrom
                            }
                            onChange={(e) => {
                              if (editingCoupon) {
                                setEditingCoupon((prev) => ({
                                  ...prev,
                                  validFrom: e.target.value,
                                }));
                              } else {
                                setNewCoupon((prev) => ({
                                  ...prev,
                                  validFrom: e.target.value,
                                }));
                              }
                            }}
                            className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valid Until *
                          </label>
                          <Input
                            type="date"
                            value={
                              editingCoupon
                                ? editingCoupon.validUntil
                                : newCoupon.validUntil
                            }
                            onChange={(e) => {
                              if (editingCoupon) {
                                setEditingCoupon((prev) => ({
                                  ...prev,
                                  validUntil: e.target.value,
                                }));
                              } else {
                                setNewCoupon((prev) => ({
                                  ...prev,
                                  validUntil: e.target.value,
                                }));
                              }
                            }}
                            className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-amber-600" />
                        Status
                      </h3>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={
                            editingCoupon
                              ? editingCoupon.isActive
                              : newCoupon.isActive
                          }
                          onChange={(e) => {
                            if (editingCoupon) {
                              setEditingCoupon((prev) => ({
                                ...prev,
                                isActive: e.target.checked,
                              }));
                            } else {
                              setNewCoupon((prev) => ({
                                ...prev,
                                isActive: e.target.checked,
                              }));
                            }
                          }}
                          className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                        />
                        <label
                          htmlFor="isActive"
                          className="text-sm font-medium text-gray-700"
                        >
                          Activate this coupon immediately
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Uncheck to create the coupon in inactive state
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            {editingCoupon ? "Updating..." : "Creating..."}
                          </>
                        ) : editingCoupon ? (
                          <>
                            <Edit className="w-5 h-5 mr-2" />
                            Update Coupon
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 mr-2" />
                            Create Coupon
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingCoupon(null);
                        }}
                        className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
