"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Camera,
  Save,
  X,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Award,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const ProfileEdit = ({ user }) => {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    avatar: user.avatar?.url || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar?.url || "");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { ...formData };

      if (avatarFile) {
        updateData.avatar = {
          url: avatarPreview,
          public_id: "temp-id",
        };
      }

      const result = await updateProfile(updateData);

      if (result.success) {
        toast.success("Profile updated successfully!");
        setAvatarFile(null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar?.url || "",
    });
    setAvatarPreview(user.avatar?.url || "");
    setAvatarFile(null);
  };

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

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-8"
    >
      <motion.div
        variants={fadeInUp}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Edit Profile
          </h2>
          <p className="text-gray-600 mt-2">
            Update your personal information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-amber-700 font-medium text-sm">
            Premium Account
          </span>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-8 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Profile Picture
            </h3>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <motion.div whileHover={{ scale: 1.05 }} className="relative group">
              <div className="relative">
                <img
                  src={avatarPreview || "/placeholder-avatar.jpg"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl group-hover:shadow-3xl transition-all duration-300"
                />
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </motion.label>
              </div>
            </motion.div>

            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Upload a new profile picture
              </h4>
              <p className="text-gray-600 mb-4">
                Choose a clear, professional photo that represents you well.
                This will be visible to other users.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>JPG, PNG or GIF supported</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Maximum file size: 2MB</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-8 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label
                htmlFor="name"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>Full Name</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                required
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700"
              >
                <Mail className="w-4 h-4 text-amber-600" />
                <span>Email Address</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                required
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2 md:col-span-2"
            >
              <label
                htmlFor="phone"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700"
              >
                <Phone className="w-4 h-4 text-amber-600" />
                <span>Phone Number</span>
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl py-3"
                required
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Account Information */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-8 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Account Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Account Status
                </span>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.isEmailVerified
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                    : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200"
                }`}
              >
                {user.isEmailVerified
                  ? "✓ Verified"
                  : "⏳ Pending Verification"}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Member Since
                </span>
              </div>
              <p className="text-gray-900 font-semibold">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Account Type
                </span>
              </div>
              <p className="text-gray-900 font-semibold capitalize">
                {user.role === "admin" ? "Administrator" : "Premium Customer"}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700 hover:text-amber-800 px-8 py-3 rounded-xl font-medium transition-all duration-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Changes
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ProfileEdit;
