"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X,
} from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";

export default function BankDetailsManagement() {
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
    isVerified: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
  });

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getBankDetails();
      setBankDetails(response.data.bankDetails);
      setFormData({
        accountHolderName: response.data.bankDetails.accountHolderName || "",
        accountNumber: response.data.bankDetails.accountNumber || "",
        ifscCode: response.data.bankDetails.ifscCode || "",
        bankName: response.data.bankDetails.bankName || "",
        branchName: response.data.bankDetails.branchName || "",
        upiId: response.data.bankDetails.upiId || "",
      });
    } catch (error) {
      console.error("Error loading bank details:", error);
      toast.error("Failed to load bank details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await profileAPI.updateBankDetails(formData);
      setBankDetails(response.data.bankDetails);
      setEditing(false);
      toast.success("Bank details updated successfully");
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error(
        error.response?.data?.message || "Failed to update bank details"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      accountHolderName: bankDetails.accountHolderName || "",
      accountNumber: bankDetails.accountNumber || "",
      ifscCode: bankDetails.ifscCode || "",
      bankName: bankDetails.bankName || "",
      branchName: bankDetails.branchName || "",
      upiId: bankDetails.upiId || "",
    });
    setEditing(false);
  };

  const hasBankDetails =
    bankDetails.accountHolderName ||
    bankDetails.accountNumber ||
    bankDetails.ifscCode;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Details
            {bankDetails.isVerified && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {hasBankDetails ? "Edit" : "Add Details"}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasBankDetails && !editing ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Bank Details Added
            </h3>
            <p className="text-gray-500 mb-4">
              Add your bank details to receive refunds for COD orders
            </p>
            <Button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Add Bank Details
            </Button>
          </div>
        ) : editing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <Input
                  value={formData.accountHolderName}
                  onChange={(e) =>
                    handleInputChange("accountHolderName", e.target.value)
                  }
                  placeholder="Enter account holder name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) =>
                    handleInputChange("accountNumber", e.target.value)
                  }
                  placeholder="Enter account number"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code *
                </label>
                <Input
                  value={formData.ifscCode}
                  onChange={(e) =>
                    handleInputChange("ifscCode", e.target.value.toUpperCase())
                  }
                  placeholder="Enter IFSC code"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <Input
                  value={formData.bankName}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                  placeholder="Enter bank name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <Input
                  value={formData.branchName}
                  onChange={(e) =>
                    handleInputChange("branchName", e.target.value)
                  }
                  placeholder="Enter branch name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <Input
                  value={formData.upiId}
                  onChange={(e) => handleInputChange("upiId", e.target.value)}
                  placeholder="Enter UPI ID (optional)"
                  className="w-full"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Important Information
                  </h4>
                  <p className="text-sm text-blue-700">
                    Your bank details will be used to process refunds for COD
                    orders. Make sure the information is accurate to avoid
                    delays in refund processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Account Holder Name
                </label>
                <p className="text-gray-900 font-medium">
                  {bankDetails.accountHolderName || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Account Number
                </label>
                <p className="text-gray-900 font-medium">
                  {bankDetails.accountNumber
                    ? `****${bankDetails.accountNumber.slice(-4)}`
                    : "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  IFSC Code
                </label>
                <p className="text-gray-900 font-medium">
                  {bankDetails.ifscCode || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Bank Name
                </label>
                <p className="text-gray-900 font-medium">
                  {bankDetails.bankName || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Branch Name
                </label>
                <p className="text-gray-900 font-medium">
                  {bankDetails.branchName || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  UPI ID
                </label>
                <p className="text-gray-900 font-medium">
                  {bankDetails.upiId || "Not provided"}
                </p>
              </div>
            </div>

            {!bankDetails.isVerified && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">
                      Verification Pending
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Your bank details are pending verification. This may delay
                      refund processing for COD orders.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
