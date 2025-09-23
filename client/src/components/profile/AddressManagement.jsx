"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Star,
  X,
  Save,
  Home,
  Building,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { profileAPI } from "@/lib/api";

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await profileAPI.getAddresses();
      if (data?.success) setAddresses(data.addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let resp;
      if (editingAddress) {
        resp = await profileAPI.updateAddress(editingAddress._id, formData);
      } else {
        resp = await profileAPI.addAddress(formData);
      }

      if (resp.data?.success) {
        setAddresses(resp.data.addresses);
        setShowForm(false);
        setEditingAddress(null);
        resetForm();
        toast.success(
          editingAddress
            ? "Address updated successfully!"
            : "Address added successfully!"
        );
      } else {
        toast.error(resp.data?.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const resp = await profileAPI.deleteAddress(addressId);

      if (resp.data?.success) {
        setAddresses(resp.data.addresses);
        toast.success("Address deleted successfully!");
      } else {
        toast.error(resp.data?.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const resp = await profileAPI.setDefaultAddress(addressId);

      if (resp.data?.success) {
        setAddresses(resp.data.addresses);
        toast.success("Default address updated!");
      } else {
        toast.error(resp.data?.message || "Failed to update default address");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to update default address");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    resetForm();
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-8"
    >
      <motion.div
        variants={fadeInUp}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Address Management
          </h2>
          <p className="text-gray-600 mt-2">
            Manage your delivery addresses for seamless shopping
          </p>
        </div>
        {!showForm && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Address
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit Address Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-8 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelForm}
                  className="border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700 hover:text-amber-800 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Home className="w-4 h-4 text-amber-600" />
                    <span>Full Name</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                    required
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Building className="w-4 h-4 text-amber-600" />
                    <span>Phone Number</span>
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                    required
                  />
                </motion.div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Street Address</span>
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                  required
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                    required
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                    required
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pincode
                  </label>
                  <Input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                    className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                    required
                  />
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
              >
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-2 border-amber-300 text-amber-600 focus:ring-amber-500 focus:ring-2"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm text-gray-700 font-medium flex items-center space-x-2"
                >
                  <Star className="w-4 h-4 text-amber-600" />
                  <span>Set as default address</span>
                </label>
              </motion.div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelForm}
                    disabled={loading}
                    className="w-full sm:w-auto border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700 hover:text-amber-800 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading
                      ? "Saving..."
                      : editingAddress
                      ? "Update Address"
                      : "Add Address"}
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Addresses List */}
      <motion.div variants={fadeInUp} className="space-y-6">
        {addresses.length === 0 ? (
          <motion.div
            variants={scaleIn}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-12 text-center shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <MapPin className="w-10 h-10 text-amber-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No addresses found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add your first delivery address to get started with seamless
              shopping experience
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Address
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {addresses.map((address, index) => (
              <motion.div
                key={address._id}
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
                        <Home className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {address.name}
                        </h4>
                        {address.isDefault && (
                          <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200 mt-1">
                            <Star className="w-3 h-3 mr-1" />
                            Default Address
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-amber-600" />
                        <span>{address.phone}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p>{address.address}</p>
                          <p>
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-amber-100">
                  {!address.isDefault && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address._id)}
                        className="border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700 hover:text-amber-800 rounded-xl"
                        title="Set as default"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                      className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded-xl"
                      title="Edit address"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address._id)}
                      className="border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700 hover:text-red-800 rounded-xl"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AddressManagement;
