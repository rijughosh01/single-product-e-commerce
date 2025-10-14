"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Grid3X3,
  TrendingUp,
  DollarSign,
  UserCheck,
  Shield,
  Activity,
  Tag,
  Truck,
  FileText,
  Calendar,
  RotateCcw,
  Banknote,
} from "lucide-react";
import NotificationSystem from "./NotificationSystem";

const AdminLayout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && !["admin", "vendor"].includes(user.role)) {
      toast.error("Access denied. Admin or Vendor privileges required.");
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getNavigationItems = () => {
    const allNavigation = [
      {
        name: "Dashboard",
        href: "/admin",
        icon: Home,
        description: "Overview and analytics",
        roles: ["admin", "vendor"],
      },
      {
        name: "Products",
        href: "/admin/products",
        icon: Package,
        description: "Manage product catalog",
        roles: ["admin"],
      },
      {
        name: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        description: "Order management",
        roles: ["admin", "vendor"],
      },
      {
        name: "Returns",
        href: "/admin/returns",
        icon: RotateCcw,
        description: "Return management",
        roles: ["admin", "vendor"],
      },
      {
        name: "Bank Verification",
        href: "/admin/bank-verification",
        icon: Banknote,
        description: "Verify bank details",
        roles: ["admin"],
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: Users,
        description: "Customer management",
        roles: ["admin"],
      },
      {
        name: "Coupons",
        href: "/admin/coupons",
        icon: Tag,
        description: "Discount management",
        roles: ["admin"],
      },
      {
        name: "Shipping",
        href: "/admin/shipping",
        icon: Truck,
        description: "Shipping rules",
        roles: ["admin"],
      },
      {
        name: "Payments",
        href: "/admin/payments",
        icon: DollarSign,
        description: "Payment management",
        roles: ["admin"],
      },
      {
        name: "Invoices",
        href: "/admin/invoices",
        icon: FileText,
        description: "Invoice management",
        roles: ["admin"],
      },
      {
        name: "Subscriptions",
        href: "/admin/subscriptions",
        icon: Calendar,
        description: "Subscription management",
        roles: ["admin"],
      },
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        description: "Business insights",
        roles: ["admin"],
      },
    ];

    // Filter navigation items based on user role
    return allNavigation.filter((item) =>
      item.roles.includes(user?.role || "")
    );
  };

  const navigation = getNavigationItems();

  const getPageTitle = () => {
    const currentNav = navigation.find((nav) => nav.href === pathname);
    return currentNav ? currentNav.name : "Admin Dashboard";
  };

  if (!isAuthenticated || (user && !["admin", "vendor"].includes(user.role))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col min-h-0 max-h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {user?.role === "vendor" ? "Vendor Panel" : "Admin Panel"}
              </h1>
              <p className="text-xs text-blue-100">Pure Ghee Store</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto min-h-0">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                <item.icon
                  className={`mr-4 h-5 w-5 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div
                    className={`text-xs ${
                      isActive ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={user?.name}
                  >
                    {user?.name}
                  </p>
                  <p
                    className="text-xs text-gray-500 truncate"
                    title={user?.email}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                  userDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10">
                <Link
                  href="/"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Grid3X3 className="w-4 h-4 mr-3" />
                  View Store
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.name} (
                  {user?.role === "vendor" ? "Vendor" : "Admin"})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-48"
                />
              </div>

              <NotificationSystem />

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 text-green-600">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">Online</span>
                </div>
                {/* <div className="flex items-center space-x-2 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+12%</span>
                </div> */}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
