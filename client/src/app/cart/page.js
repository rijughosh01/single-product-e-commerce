"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Truck,
  Shield,
  CreditCard,
  Package,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { productsAPI } from "@/lib/api";
import CartSummary from "@/components/CartSummary";

export default function Cart() {
  const router = useRouter();
  const {
    cart,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    addToCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  // Fetch recommended products
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoadingRecommendations(true);
        let response;
        try {
          response = await productsAPI.getFeatured();
        } catch (e) {
          response = await productsAPI.getAll({ limit: 8 });
        }
        const all = response?.data?.products || [];
        const inCartIds = new Set(cart.map((i) => i.product._id));
        const filtered = all.filter((p) => !inCartIds.has(p._id)).slice(0, 4);
        setRecommended(filtered);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
        setRecommended([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };
    fetchRecommended();
  }, [cart]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShoppingCart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Please Login
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              You need to be logged in to view your cart and continue shopping
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Login to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <ShoppingCart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Discover our premium ghee collection and add some products to get
              started
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/products">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Shopping Cart
              </h1>
              <p className="text-lg text-gray-600">
                {cartCount} items in your cart
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShoppingCart className="w-6 h-6" />
                  Cart Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {cart.map((item, index) => (
                  <div
                    key={item._id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-gradient-to-r from-white to-orange-50 border border-orange-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0">
                      <Image
                        src={
                          item.product.images[0]?.url || "/placeholder-ghee.jpg"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {item.quantity}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {item.product.type} - {item.product.size}
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          ₹{item.product.price}
                        </span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-gray-400 line-through text-lg">
                            ₹{item.product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300 rounded-xl"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg bg-orange-100 text-orange-800 py-2 px-3 rounded-xl">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300 rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{item.product.price * item.quantity}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              onProceedToCheckout={handleProceedToCheckout}
              className="sticky top-8"
            />
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              You might also like
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover more premium ghee products that complement your cart
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingRecommendations ? (
              [...Array(4)].map((_, index) => (
                <Card key={index} className="product-card animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl"></div>
                  <CardContent className="p-6">
                    <div className="h-5 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : recommended.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">
                  No recommendations available right now.
                </p>
              </div>
            ) : (
              recommended.map((product, index) => (
                <Card
                  key={product._id}
                  className="product-card group overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-50">
                    <Image
                      src={product.images?.[0]?.url || "/placeholder-ghee.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      {product.originalPrice > product.price && (
                        <Badge className="inline-flex items-center gap-2 bg-amber-500 text-white border">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <Link
                      href={`/products/${product._id}`}
                      className="block group"
                    >
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        ₹{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-gray-400 line-through text-lg">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                        onClick={() => addToCart(product._id, 1)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                      <Link href={`/products/${product._id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 rounded-xl transition-all duration-300"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
