"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, MapPin, Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import { profileAPI } from "@/lib/api";

const AddressSelector = ({
  selectedAddress,
  onAddressSelect,
  onAddressChange,
}) => {
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
      if (data?.success) {
        setAddresses(data.addresses);

        if (!selectedAddress && data.addresses.length > 0) {
          const defaultAddr =
            data.addresses.find((addr) => addr.isDefault) || data.addresses[0];
          onAddressSelect(defaultAddr);
        }
      }
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

        // If this is the first address or it's set as default, select it
        if (resp.data.addresses.length === 1 || formData.isDefault) {
          const newAddress = resp.data.addresses.find((addr) =>
            editingAddress
              ? addr._id === editingAddress._id
              : addr.name === formData.name && addr.phone === formData.phone
          );
          if (newAddress) {
            onAddressSelect(newAddress);
          }
        }
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

        if (selectedAddress && selectedAddress._id === addressId) {
          if (resp.data.addresses.length > 0) {
            const defaultAddr =
              resp.data.addresses.find((addr) => addr.isDefault) ||
              resp.data.addresses[0];
            onAddressSelect(defaultAddr);
          } else {
            onAddressSelect(null);
          }
        }
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

  const handleAddressSelect = (address) => {
    onAddressSelect(address);
    onAddressChange && onAddressChange(address);
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Select Delivery Address
        </h3>
        {!showForm && (
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400 rounded-xl transition-all duration-300 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      {/* Add/Edit Address Form */}
      {showForm && (
        <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader className="pb-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelForm}
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  required
                  className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    required
                    className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    required
                    className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <Input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                    required
                    className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelForm}
                  disabled={loading}
                  className="rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading
                    ? "Saving..."
                    : editingAddress
                    ? "Update Address"
                    : "Add Address"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address Selection */}
      {!showForm && (
        <div className="space-y-3">
          {addresses.length === 0 ? (
            <Card className="p-6 text-center border-dashed border-2 border-gray-200">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                No addresses found
              </h4>
              <p className="text-xs text-gray-600 mb-4">
                Add a delivery address to continue
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 hover:bg-orange-600"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </Card>
          ) : (
            addresses.map((address, index) => (
              <Card
                key={address._id}
                className={`cursor-pointer transition-all duration-300 group ${
                  selectedAddress?._id === address._id
                    ? "ring-2 ring-orange-500 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg"
                    : "hover:border-orange-300 hover:shadow-lg bg-white"
                }`}
                onClick={() => handleAddressSelect(address)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                          {address.name}
                        </h4>
                        {address.isDefault && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {selectedAddress?._id === address._id && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-base text-gray-600 mb-2 font-medium">
                        📞 {address.phone}
                      </p>
                      <p className="text-base text-gray-600 mb-2 font-medium">
                        📍 {address.address}
                      </p>
                      <p className="text-base text-gray-600 font-medium">
                        🏙️ {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!address.isDefault && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address._id);
                          }}
                          className="text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(address);
                        }}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address._id);
                        }}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Address Required Message */}
      {!selectedAddress && addresses.length > 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          Please select a delivery address to continue with your order.
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
