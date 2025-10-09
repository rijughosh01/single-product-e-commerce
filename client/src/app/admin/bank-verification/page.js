"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Banknote,
  User,
  Mail,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function BankVerificationPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getAllUsersWithBankDetails();
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBankDetails = async (userId) => {
    try {
      setUpdating(true);
      const response = await profileAPI.verifyBankDetails(userId);

      if (response.data.success) {
        toast.success("Bank details verified successfully!");

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  bankDetails: {
                    ...user.bankDetails,
                    isVerified: true,
                    isRejected: false,
                  },
                }
              : user
          )
        );
      } else {
        toast.error(response.data.message || "Failed to verify bank details");
      }
    } catch (error) {
      console.error("Error verifying bank details:", error);
      toast.error(
        error.response?.data?.message || "Failed to verify bank details"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectBankDetails = async (userId) => {
    if (!confirm("Are you sure you want to reject these bank details?")) {
      return;
    }

    try {
      setUpdating(true);
      const response = await profileAPI.rejectBankDetails(userId);

      if (response.data.success) {
        toast.success("Bank details rejected");

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  bankDetails: {
                    ...user.bankDetails,
                    isVerified: false,
                    isRejected: true,
                  },
                }
              : user
          )
        );
      } else {
        toast.error(response.data.message || "Failed to reject bank details");
      }
    } catch (error) {
      console.error("Error rejecting bank details:", error);
      toast.error("Failed to reject bank details");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.bankDetails?.bankName &&
        user.bankDetails.bankName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && user.bankDetails?.isVerified) ||
      (filterStatus === "pending" &&
        user.bankDetails &&
        !user.bankDetails.isVerified) ||
      (filterStatus === "rejected" && user.bankDetails?.isRejected);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading bank verification data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bank Details Verification
          </h1>
          <p className="text-gray-600">
            Manage and verify customer bank details for COD refunds
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, or bank name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button
                  onClick={fetchUsers}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-6">
          {filteredUsers.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No users have provided bank details yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card
                key={user._id}
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.bankDetails?.isVerified ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : user.bankDetails?.isRejected ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {user.bankDetails ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Account Holder
                          </label>
                          <p className="text-sm font-medium text-gray-900">
                            {user.bankDetails.accountHolderName ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Bank Name
                          </label>
                          <p className="text-sm font-medium text-gray-900">
                            {user.bankDetails.bankName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Account Number
                          </label>
                          <p className="text-sm font-medium text-gray-900 font-mono">
                            {user.bankDetails.accountNumber
                              ? `****${user.bankDetails.accountNumber.slice(
                                  -4
                                )}`
                              : "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            IFSC Code
                          </label>
                          <p className="text-sm font-medium text-gray-900 font-mono">
                            {user.bankDetails.ifscCode || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Branch Name
                          </label>
                          <p className="text-sm font-medium text-gray-900">
                            {user.bankDetails.branchName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            UPI ID
                          </label>
                          <p className="text-sm font-medium text-gray-900">
                            {user.bankDetails.upiId || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {!user.bankDetails.isVerified &&
                        !user.bankDetails.isRejected && (
                          <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <Button
                              onClick={() => handleVerifyBankDetails(user._id)}
                              disabled={updating}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {updating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Verify
                            </Button>
                            <Button
                              onClick={() => handleRejectBankDetails(user._id)}
                              disabled={updating}
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No bank details provided yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
