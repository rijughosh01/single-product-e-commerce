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
  MapPin,
  Truck,
  Loader2,
  AlertCircle,
  Upload,
  X,
  Settings,
} from "lucide-react";
import { shippingAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AdminShippingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [shippingRules, setShippingRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    pincodeType: "single",
    pincodes: "",
    shippingCharges: "",
    freeShippingThreshold: "",
    estimatedMin: "",
    estimatedMax: "",
    isActive: true,
    priority: 1,
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

    fetchShippingRules();
  }, [isAuthenticated, user, router]);

  const fetchShippingRules = async () => {
    setLoading(true);
    try {
      const response = await shippingAPI.getShippingRules();
      setShippingRules(response.data.shippingRules || []);
    } catch (error) {
      console.error("Error fetching shipping rules:", error);
      toast.error("Failed to load shipping rules");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pincodesArray = (newRule.pincodes || "")
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        name: newRule.name,
        description: newRule.description || `${newRule.name} shipping rule`,
        pincodeType: newRule.pincodeType || "single",
        pincodes: newRule.pincodeType === "single" ? pincodesArray : [],
        pincodeRanges: [],
        states: [],
        zones: [],
        shippingCharges: Number(newRule.shippingCharges || 0),
        freeShippingThreshold: Number(newRule.freeShippingThreshold || 0),
        estimatedDeliveryDays: {
          min: Number(newRule.estimatedMin || 1),
          max: Number(newRule.estimatedMax || newRule.estimatedMin || 1),
        },
        isActive: Boolean(newRule.isActive),
        priority: Number(newRule.priority || 1),
      };

      await shippingAPI.createShippingRule(payload);
      toast.success("Shipping rule created successfully!");
      setShowCreateForm(false);
      setNewRule({
        name: "",
        description: "",
        pincodeType: "single",
        pincodes: "",
        shippingCharges: "",
        freeShippingThreshold: "",
        estimatedMin: "",
        estimatedMax: "",
        isActive: true,
        priority: 1,
      });
      fetchShippingRules();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create shipping rule";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pincodesArray = (
        editingRule.pincodesInput ??
        (Array.isArray(editingRule.pincodes)
          ? editingRule.pincodes.join(",")
          : "")
      )
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        name: editingRule.name,
        description:
          editingRule.description || `${editingRule.name} shipping rule`,
        pincodeType: editingRule.pincodeType || "single",
        pincodes: editingRule.pincodeType === "single" ? pincodesArray : [],
        pincodeRanges: editingRule.pincodeRanges || [],
        states: editingRule.states || [],
        zones: editingRule.zones || [],
        shippingCharges: Number(editingRule.shippingCharges || 0),
        freeShippingThreshold: Number(editingRule.freeShippingThreshold || 0),
        estimatedDeliveryDays: {
          min: Number(
            editingRule.estimatedDeliveryDays?.min ??
              editingRule.estimatedMin ??
              1
          ),
          max: Number(
            editingRule.estimatedDeliveryDays?.max ??
              editingRule.estimatedMax ??
              editingRule.estimatedMin ??
              1
          ),
        },
        isActive: Boolean(editingRule.isActive),
        priority: Number(editingRule.priority || 1),
      };

      await shippingAPI.updateShippingRule(editingRule._id, payload);
      toast.success("Shipping rule updated successfully!");
      setEditingRule(null);
      fetchShippingRules();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update shipping rule";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm("Are you sure you want to delete this shipping rule?")) {
      return;
    }
    try {
      await shippingAPI.deleteShippingRule(ruleId);
      toast.success("Shipping rule deleted successfully");
      fetchShippingRules();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete shipping rule";
      toast.error(message);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      toast.info("Bulk upload feature coming soon!");
    } catch (error) {
      toast.error("Failed to upload shipping rules");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const filteredRules = shippingRules.filter((rule) => {
    const pins = Array.isArray(rule.pincodes)
      ? rule.pincodes.join(",")
      : rule.pincodes || "";
    return (
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pins.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shipping Management</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById("bulk-upload").click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <input
              id="bulk-upload"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleBulkUpload}
              className="hidden"
            />
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search shipping rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Shipping Rules List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading shipping rules...</span>
          </div>
        ) : filteredRules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No shipping rules found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "No shipping rules match your search criteria"
                  : "Create your first shipping rule to get started"}
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRules.map((rule) => (
              <Card key={rule._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        <Badge className={getStatusColor(rule.isActive)}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {Array.isArray(rule.pincodes)
                              ? rule.pincodes.join(", ")
                              : rule.pincodes}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>
                            Charge: {formatPrice(rule.shippingCharges || 0)}
                          </span>
                        </div>
                        <div>
                          <span>
                            Free above:{" "}
                            {formatPrice(rule.freeShippingThreshold)}
                          </span>
                        </div>
                        <div>
                          <span>
                            Delivery: {rule.estimatedDeliveryDays?.min ?? "-"}-
                            {rule.estimatedDeliveryDays?.max ?? "-"} days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRule(rule._id)}
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

        {/* Create/Edit Rule Modal */}
        {(showCreateForm || editingRule) && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">
                      {editingRule
                        ? "Edit Shipping Rule"
                        : "Create New Shipping Rule"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingRule(null);
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form
                    onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
                    className="space-y-6"
                  >
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Basic Information
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Rule Name
                        </label>
                        <Input
                          value={editingRule ? editingRule.name : newRule.name}
                          onChange={(e) => {
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }));
                            }
                          }}
                          placeholder="Enter rule name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <Input
                          value={
                            editingRule
                              ? editingRule.description ?? ""
                              : newRule.description
                          }
                          onChange={(e) => {
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }));
                            }
                          }}
                          placeholder="Short description"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Pincode Settings
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Pincode Type
                        </label>
                        <select
                          value={
                            editingRule
                              ? editingRule.pincodeType || "single"
                              : newRule.pincodeType
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                pincodeType: value,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                pincodeType: value,
                              }));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="single">Specific pincodes</option>
                          <option value="all">All pincodes (default)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Pincodes
                        </label>
                        <Input
                          value={
                            editingRule
                              ? editingRule.pincodesInput ??
                                (Array.isArray(editingRule.pincodes)
                                  ? editingRule.pincodes.join(",")
                                  : "")
                              : newRule.pincodes
                          }
                          onChange={(e) => {
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                pincodesInput: e.target.value,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                pincodes: e.target.value,
                              }));
                            }
                          }}
                          placeholder="Enter pincodes (comma separated)"
                          disabled={
                            (editingRule
                              ? editingRule.pincodeType || "single"
                              : newRule.pincodeType) !== "single"
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Charges
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Shipping Charge
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={
                            editingRule
                              ? editingRule.shippingCharges ?? ""
                              : newRule.shippingCharges ?? ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                shippingCharges: val === "" ? "" : val,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                shippingCharges: val === "" ? "" : val,
                              }));
                            }
                          }}
                          placeholder="Enter shipping charge"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Free Shipping Threshold
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={
                            editingRule
                              ? editingRule.freeShippingThreshold ?? ""
                              : newRule.freeShippingThreshold ?? ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                freeShippingThreshold: val === "" ? "" : val,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                freeShippingThreshold: val === "" ? "" : val,
                              }));
                            }
                          }}
                          placeholder="Enter free shipping threshold"
                        />
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Estimated Delivery
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Estimated Delivery Days (Min)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={
                            editingRule
                              ? editingRule.estimatedDeliveryDays?.min ??
                                editingRule.estimatedMin ??
                                ""
                              : newRule.estimatedMin ?? ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                estimatedMin: val === "" ? "" : val,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                estimatedMin: val === "" ? "" : val,
                              }));
                            }
                          }}
                          placeholder="Minimum delivery days"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Estimated Delivery Days (Max)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={
                            editingRule
                              ? editingRule.estimatedDeliveryDays?.max ??
                                editingRule.estimatedMax ??
                                ""
                              : newRule.estimatedMax ?? ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                estimatedMax: val === "" ? "" : val,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                estimatedMax: val === "" ? "" : val,
                              }));
                            }
                          }}
                          placeholder="Maximum delivery days"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-amber-600" />{" "}
                        Status
                      </h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={
                            editingRule
                              ? editingRule.isActive
                              : newRule.isActive
                          }
                          onChange={(e) => {
                            if (editingRule) {
                              setEditingRule((prev) => ({
                                ...prev,
                                isActive: e.target.checked,
                              }));
                            } else {
                              setNewRule((prev) => ({
                                ...prev,
                                isActive: e.target.checked,
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <label
                          htmlFor="isActive"
                          className="text-sm font-medium"
                        >
                          Active
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Priority
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={
                          editingRule
                            ? editingRule.priority ?? 1
                            : newRule.priority ?? 1
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (editingRule) {
                            setEditingRule((prev) => ({
                              ...prev,
                              priority: val === "" ? 1 : Number(val),
                            }));
                          } else {
                            setNewRule((prev) => ({
                              ...prev,
                              priority: val === "" ? 1 : Number(val),
                            }));
                          }
                        }}
                        placeholder="Rule priority (1 = highest)"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            {editingRule ? "Updating..." : "Creating..."}
                          </>
                        ) : editingRule ? (
                          "Update Rule"
                        ) : (
                          "Create Rule"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingRule(null);
                        }}
                        className="px-6"
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
