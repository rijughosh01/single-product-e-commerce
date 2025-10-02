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
  Home,
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

    // Filter coupons that can be used
    const usableCoupons = eligibleCoupons.filter((c) => {
      if (c.canUse === false) return false;
      if (c.remainingUses !== undefined && c.remainingUses <= 0) return false;
      return true;
    });

    const couponsWithDiscount = usableCoupons
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
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top banner - Desktop/Tablet */}
      <div className="hidden md:block bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 text-sm">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2 text-gray-700">
                <Truck className="w-4 h-4 text-orange-500" />
                <span className="font-medium">
                  Free shipping on orders above ₹1000
                </span>
              </div>
              {isAuthenticated && bestCoupon && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">
                    Best offer:{" "}
                    <b className="text-orange-600">{bestCoupon.code}</b>
                    {bestCoupon._discount > 0 && (
                      <span className="text-green-600 ml-1">
                        (Save ₹{Math.round(bestCoupon._discount)})
                      </span>
                    )}
                    {bestCoupon.remainingUses !== undefined &&
                      bestCoupon.remainingUses > 0 && (
                        <span className="text-blue-600 text-xs ml-1">
                          ({bestCoupon.remainingUses} left)
                        </span>
                      )}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-6 mt-2 sm:mt-0">
              <div className="flex items-center space-x-2 text-gray-700">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="font-medium">+91 9382770558</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="font-medium">info@pureghee.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top banner - Mobile */}
      <div className="md:hidden border-b border-amber-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 text-xs">
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              <Truck className="w-3.5 h-3.5" /> Free shipping ₹1000+
            </span>
            {isAuthenticated && bestCoupon && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                <Star className="w-3.5 h-3.5" /> {bestCoupon.code}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Package className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                Pure Ghee
              </h1>
              <p className="hidden md:block text-sm text-gray-500 font-medium">
                Premium Quality
              </p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-orange-500 transition-colors duration-300" />
                <Input
                  type="text"
                  placeholder="Search for ghee products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                />
              </div>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-orange-600 transition-colors duration-300 font-medium relative group"
            >
              All Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-orange-600 transition-colors duration-300 flex items-center font-medium relative group">
                Ghee Types
                <svg
                  className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180"
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
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div className="absolute top-full left-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="py-2">
                  {gheeTypes.map((type) => (
                    <Link
                      key={type.name}
                      href={type.href}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                    >
                      {type.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/about"
              className="text-gray-700 hover:text-orange-600 transition-colors duration-300 font-medium relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-orange-600 transition-colors duration-300 font-medium relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              className="md:hidden p-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <span className="inline-flex md:inline-flex">
                <NotificationSystem />
              </span>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden md:inline-flex relative p-2 md:p-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 group"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white animate-pulse">
                  {wishlistCount}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="hidden md:inline-flex relative p-2 md:p-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-orange-500 text-white animate-pulse">
                  {cartCount}
                </Badge>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center space-x-2 p-2 md:p-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 group">
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:block max-w-[90px] truncate text-sm font-medium">
                    {user?.name}
                  </span>
                </button>
                <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/subscriptions"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                    >
                      Subscriptions
                    </Link>
                    <Link
                      href="/invoices"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                    >
                      Invoices
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/coupons"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                    >
                      My Coupons
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-t border-gray-100 transition-colors duration-200"
                      >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 md:p-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300"
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
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-6 space-y-6">
            {/* Mobile search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for ghee products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>
            </form>

            {/* Mobile navigation */}
            <nav className="space-y-1">
              <Link
                href="/products"
                className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Ghee Types
                </div>
                {gheeTypes.map((type) => (
                  <Link
                    key={type.name}
                    href={type.href}
                    className="block px-6 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {type.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/about"
                className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>

            {/* Mobile user menu */}
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-6 space-y-1">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Account
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  href="/subscriptions"
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Subscriptions
                </Link>
                <Link
                  href="/invoices"
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Invoices
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link
                  href="/coupons"
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Coupons
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium border-t border-gray-100 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Account
                </div>
                <Link
                  href="/login"
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-xl font-medium transition-all duration-300 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Tab Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <nav className="max-w-7xl mx-auto">
          <ul className="grid grid-cols-5 text-xs text-gray-700">
            <li>
              <Link href="/" className="flex flex-col items-center py-2">
                <Home className="w-5 h-5" />
                <span className="mt-1">Home</span>
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="flex flex-col items-center py-2"
              >
                <Package className="w-5 h-5" />
                <span className="mt-1">Shop</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wishlist"
                className="relative flex flex-col items-center py-2"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                    {wishlistCount}
                  </span>
                )}
                <span className="mt-1">Wishlist</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="relative flex flex-col items-center py-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] text-white">
                    {cartCount}
                  </span>
                )}
                <span className="mt-1">Cart</span>
              </Link>
            </li>
            <li>
              <Link
                href={isAuthenticated ? "/profile" : "/login"}
                className="flex flex-col items-center py-2"
              >
                <User className="w-5 h-5" />
                <span className="mt-1">
                  {isAuthenticated ? "Profile" : "Login"}
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
