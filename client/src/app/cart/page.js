"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
    window.location.href = "/checkout";
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Please Login
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your cart
            </p>
            <Link href="/login">
              <Button className="bg-amber-600 hover:bg-amber-700">
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some products to your cart to get started
            </p>
            <Link href="/products">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-600">{cartCount} items in your cart</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleClearCart}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={
                          item.product.images[0]?.url || "/placeholder-ghee.jpg"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.product.type} - {item.product.size}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-bold text-amber-600">
                          ₹{item.product.price}
                        </span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-gray-400 line-through text-sm">
                            ₹{item.product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
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
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
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
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{item.product.price * item.quantity}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-red-600 hover:text-red-700"
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
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You might also like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingRecommendations ? (
              [...Array(4)].map((_, index) => (
                <Card key={index} className="card-hover">
                  <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : recommended.length === 0 ? (
              <div className="text-gray-600">
                No recommendations available right now.
              </div>
            ) : (
              recommended.map((product) => (
                <Card
                  key={product._id}
                  className="group card-hover overflow-hidden"
                >
                  <div className="relative h-40 bg-gray-100">
                    <Image
                      src={product.images?.[0]?.url || "/placeholder-ghee.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <Link href={`/products/${product._id}`} className="block">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-600 font-bold">
                        ₹{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-gray-400 line-through text-xs">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                        onClick={() => addToCart(product._id, 1)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                      <Link href={`/products/${product._id}`}>
                        <Button size="sm" variant="outline">
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
