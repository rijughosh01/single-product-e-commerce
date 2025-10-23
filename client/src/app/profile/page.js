"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProfileOverview from "@/components/profile/ProfileOverview";
import ProfileEdit from "@/components/profile/ProfileEdit";
import AddressManagement from "@/components/profile/AddressManagement";
import BankDetailsManagement from "@/components/profile/BankDetailsManagement";
import OrderHistory from "@/components/profile/OrderHistory";
import PasswordChange from "@/components/profile/PasswordChange";
import SubscriptionManager from "@/components/SubscriptionManager";
import InvoiceManager from "@/components/InvoiceManager";
import {
  User,
  Edit,
  MapPin,
  ShoppingBag,
  Lock,
  Settings,
  FileText,
  Calendar,
  Crown,
  Sparkles,
  CreditCard,
} from "lucide-react";

const ProfilePage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600"></div>
          <p className="text-amber-700 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: User,
      color: "from-amber-500 to-orange-500",
    },
    {
      id: "edit",
      label: "Edit Profile",
      icon: Edit,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "bank-details",
      label: "Bank Details",
      icon: CreditCard,
      color: "from-teal-500 to-cyan-500",
    },
    {
      id: "orders",
      label: "Order History",
      icon: ShoppingBag,
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: Calendar,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: "password",
      label: "Change Password",
      icon: Lock,
      color: "from-red-500 to-pink-500",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <ProfileOverview user={user} />;
      case "edit":
        return <ProfileEdit user={user} />;
      case "addresses":
        return <AddressManagement />;
      case "bank-details":
        return <BankDetailsManagement />;
      case "orders":
        return <OrderHistory />;
      case "subscriptions":
        return <SubscriptionManager />;
      case "invoices":
        return <InvoiceManager />;
      case "password":
        return <PasswordChange />;
      default:
        return <ProfileOverview user={user} />;
    }
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

  const tabVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mb-8"
        >
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="text-amber-700 font-medium">
                Premium Account
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              My Profile
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your account settings, track orders, and personalize your
              ghee shopping experience
            </p>
          </motion.div>
        </motion.div>  */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100 overflow-hidden"
        >
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-amber-100">
              <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-white/60 hover:text-amber-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1 bg-gradient-to-b from-amber-50 to-orange-50 border-r border-amber-100">
              <nav className="p-6">
                <motion.ul
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                  className="space-y-3"
                >
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.li
                        key={tab.id}
                        variants={tabVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${
                            isActive
                              ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-amber-200`
                              : "text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-md"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                          <Icon
                            className={`w-5 h-5 mr-3 relative z-10 ${
                              isActive
                                ? "text-white"
                                : "text-gray-500 group-hover:text-amber-600"
                            }`}
                          />
                          <span className="relative z-10">{tab.label}</span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                              className="ml-auto"
                            >
                              <Sparkles className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="p-4 lg:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
