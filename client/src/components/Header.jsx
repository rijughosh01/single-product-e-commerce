"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import NotificationSystem from "./NotificationSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  Truck,
  Star,
  Settings,
} from "lucide-react";
import { couponsAPI } from "@/lib/api";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, cartTotal } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [eligibleCoupons, setEligibleCoupons] = useState([]);

  useEffect(() => {
    const loadEligible = async () => {
      if (!isAuthenticated) {
        setEligibleCoupons([]);
        return;
      }
      try {
        const res = await couponsAPI.getEligibleCoupons(cartTotal || 0);
        const list = res.data?.coupons || [];
        setEligibleCoupons(list);
      } catch (e) {
        setEligibleCoupons([]);
      }
    };
    loadEligible();
  }, [isAuthenticated, cartTotal]);

  const bestCoupon = useMemo(() => {
    if (!eligibleCoupons || eligibleCoupons.length === 0) return null;
    const amount = Number(cartTotal) || 0;

    const calculateDiscount = (c) => {
      if (!c) return 0;

      // Ensure minimum order amount is met
      if (amount < Number(c.minimumOrderAmount || 0)) {
        return 0;
      }

      let discount = 0;
      if (c.discountType === "percentage") {
        const rawDiscount = (amount * Number(c.discountValue || 0)) / 100;
        const maxDiscount = Number(c.maximumDiscount || 0);
        discount =
          maxDiscount > 0 ? Math.min(rawDiscount, maxDiscount) : rawDiscount;
      } else if (c.discountType === "fixed") {
        discount = Number(c.discountValue || 0);
      }

      return Math.min(discount, amount);
    };

    const couponsWithDiscount = eligibleCoupons
      .map((c) => {
        const discount = calculateDiscount(c);
        return {
          ...c,
          _discount: discount,
          _discountPercentage: amount > 0 ? (discount / amount) * 100 : 0,
        };
      })
      .filter((c) => c._discount > 0)
      .sort((a, b) => {
        if (b._discount !== a._discount) {
          return b._discount - a._discount;
        }
        return b._discountPercentage - a._discountPercentage;
      });

    return couponsWithDiscount[0] || null;
  }, [eligibleCoupons, cartTotal]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const gheeTypes = [
    { name: "Pure Cow Ghee", href: "/products?type=Pure Cow Ghee" },
    { name: "Buffalo Ghee", href: "/products?type=Buffalo Ghee" },
    { name: "Organic Ghee", href: "/products?type=Organic Ghee" },
    { name: "A2 Ghee", href: "/products?type=A2 Ghee" },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-amber-800">
                🚚 Free shipping on orders above ₹1000
              </span>
              {isAuthenticated && bestCoupon && (
                <span className="text-amber-800">
                  🎁 Offer for you: <b>{bestCoupon.code}</b>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-amber-800">📞 +91 98765 43210</span>
              <span className="text-amber-800">📧 info@pureghee.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pure Ghee</h1>
              <p className="text-xs text-gray-600">Premium Quality</p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for ghee products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              All Products
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-amber-600 transition-colors flex items-center">
                Ghee Types
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {gheeTypes.map((type) => (
                  <Link
                    key={type.name}
                    href={type.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    {type.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/about"
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden p-2 text-gray-700 hover:text-amber-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            {isAuthenticated && <NotificationSystem />}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {wishlistCount}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-amber-600 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block text-sm">{user?.name}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/subscriptions"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Subscriptions
                  </Link>
                  <Link
                    href="/invoices"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Invoices
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Wishlist
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 border-t border-gray-100"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-amber-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for ghee products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>

            {/* Mobile navigation */}
            <nav className="space-y-2">
              <Link
                href="/products"
                className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              {gheeTypes.map((type) => (
                <Link
                  key={type.name}
                  href={type.href}
                  className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {type.name}
                </Link>
              ))}
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>

            {/* Mobile user menu */}
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  href="/subscriptions"
                  className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Subscriptions
                </Link>
                <Link
                  href="/invoices"
                  className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Invoices
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md border-t border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
