"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ordersAPI, wishlistAPI } from "@/lib/api";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Heart,
  Star,
  Crown,
  Sparkles,
  Award,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProfileOverview = ({ user }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteProducts: 0,
    memberSince: "",
  });

  useEffect(() => {
    if (!user) return;
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      if (!user) return;

      // Fetch orders and wishlist in parallel
      const [ordersResponse, wishlistResponse] = await Promise.allSettled([
        ordersAPI.getOrders(),
        wishlistAPI.getWishlist(),
      ]);

      // Process orders
      const orders =
        ordersResponse.status === "fulfilled"
          ? ordersResponse.value.data.orders || []
          : [];

      if (orders.length > 0) {
        console.log("Order structure:", orders[0]);
        console.log("Available order fields:", Object.keys(orders[0]));
      }

      // Calculate total spent
      const totalSpent = orders.reduce((sum, order) => {
        const amount =
          order.totalAmount ||
          order.totalPrice ||
          order.amount ||
          order.total ||
          0;
        console.log("Order amount:", amount, "Type:", typeof amount);

        // Handle string numbers
        if (typeof amount === "string") {
          const parsed = parseFloat(amount);
          return sum + (isNaN(parsed) ? 0 : parsed);
        }

        return sum + (typeof amount === "number" ? amount : 0);
      }, 0);

      // Process wishlist
      let favoriteProducts = 0;
      if (wishlistResponse.status === "fulfilled") {
        const wishlistData = wishlistResponse.value.data;
        favoriteProducts = wishlistData.wishlist?.products?.length || 0;
      }

      // Debug: Log wishlist structure
      if (wishlistResponse.status === "fulfilled") {
        console.log("Wishlist response:", wishlistResponse.value.data);
        console.log("Wishlist object:", wishlistResponse.value.data.wishlist);
        console.log(
          "Wishlist products:",
          wishlistResponse.value.data.wishlist?.products
        );
        console.log(
          "Wishlist products count:",
          wishlistResponse.value.data.wishlist?.products?.length
        );
        console.log(
          "Wishlist data keys:",
          Object.keys(wishlistResponse.value.data)
        );
      } else {
        console.log("Wishlist request failed:", wishlistResponse.reason);
      }

      const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";

      const finalStats = {
        totalOrders: orders.length,
        totalSpent,
        favoriteProducts,
        memberSince,
      };

      console.log("Final stats:", finalStats);
      setStats(finalStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200";
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200";
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="h-6 w-40 bg-amber-200 rounded mb-4 animate-pulse" />
          <div className="h-4 w-64 bg-amber-200 rounded animate-pulse" />
        </div>
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
      {/* Profile Header */}
      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-amber-100 rounded-2xl p-8 border border-amber-200"
      >
        {/* Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-amber-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-orange-300 rounded-full blur-2xl"></div>
        </div>

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          <motion.div variants={scaleIn} className="relative group">
            <div className="relative">
              <img
                src={user.avatar?.url || "/placeholder-avatar.jpg"}
                alt={user.name}
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2 rounded-full shadow-lg"
            >
              <Crown className="w-4 h-4" />
            </motion.div>
          </motion.div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                {user.name}
              </h2>
              <p className="text-lg text-gray-600 mt-1">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                className={`${getStatusColor(
                  user.isEmailVerified ? "verified" : "pending"
                )} px-4 py-2 text-sm font-medium`}
              >
                <div className="flex items-center space-x-2">
                  {user.isEmailVerified ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                  <span>
                    {user.isEmailVerified ? "Email Verified" : "Email Pending"}
                  </span>
                </div>
              </Badge>

              <Badge className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200 px-4 py-2 text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>
                    {user.role === "admin"
                      ? "Administrator"
                      : "Premium Customer"}
                  </span>
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: "from-blue-500 to-cyan-500",
            bgColor: "from-blue-50 to-cyan-50",
            borderColor: "border-blue-200",
          },
          {
            title: "Total Spent",
            value: `₹${stats.totalSpent.toLocaleString()}`,
            icon: TrendingUp,
            color: "from-green-500 to-emerald-500",
            bgColor: "from-green-50 to-emerald-50",
            borderColor: "border-green-200",
          },
          {
            title: "Favorite Products",
            value: stats.favoriteProducts,
            icon: Heart,
            color: "from-pink-500 to-rose-500",
            bgColor: "from-pink-50 to-rose-50",
            borderColor: "border-pink-200",
          },
          {
            title: "Member Since",
            value: stats.memberSince.split(" ")[1] || "2024",
            icon: Calendar,
            color: "from-purple-500 to-violet-500",
            bgColor: "from-purple-50 to-violet-50",
            borderColor: "border-purple-200",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={scaleIn}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {stat.title}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Contact Information */}
      <motion.div
        variants={fadeInUp}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-8 shadow-lg"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Email</p>
              <p className="text-gray-900 font-semibold">{user.email}</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Phone</p>
              <p className="text-gray-900 font-semibold">{user.phone}</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Addresses</p>
              <p className="text-gray-900 font-semibold">
                {user.addresses?.length > 0
                  ? `${user.addresses.length} address${
                      user.addresses.length > 1 ? "es" : ""
                    } saved`
                  : "No addresses saved"}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={fadeInUp}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-8 shadow-lg"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
        </div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-gray-900 font-medium">Account created</span>
            </div>
            <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-green-200">
              {stats.memberSince}
            </span>
          </motion.div>

          {user.isEmailVerified && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                <span className="text-gray-900 font-medium">
                  Email verified
                </span>
              </div>
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-blue-200">
                Recently
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileOverview;
