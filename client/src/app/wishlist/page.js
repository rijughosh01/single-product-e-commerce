"use client";

import { useState } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  Star,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const WishlistPage = () => {
  const { wishlist, loading, error, removeFromWishlist, clearWishlist } =
    useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [removingItem, setRemovingItem] = useState(null);
  const [clearingWishlist, setClearingWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItem(productId);
    try {
      const result = await removeFromWishlist(productId);
      if (!result) {
        console.error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(product._id);
    try {
      const result = await addToCart(product._id, 1);
      if (!result.success) {
        console.error("Failed to add to cart:", result);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleClearWishlist = async () => {
    if (
      window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      setClearingWishlist(true);
      await clearWishlist();
      setClearingWishlist(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Please login to view your wishlist
            </h2>
            <p className="mt-2 text-base text-gray-700">
              You need to be logged in to access your wishlist.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full animate-pulse flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <p className="mt-2 text-lg font-medium text-gray-700">
              Loading your wishlist...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
              <p className="mt-2 text-lg text-gray-700">
                {wishlist.length === 0
                  ? "Your wishlist is empty"
                  : `${wishlist.length} item${
                      wishlist.length === 1 ? "" : "s"
                    } in your wishlist`}
              </p>
            </div>
            {wishlist.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                disabled={clearingWishlist}
                className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
              >
                {clearingWishlist ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Clear Wishlist
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Heart className="h-12 w-12 text-white" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-gray-900">
              Your wishlist is empty
            </h3>
            <p className="mt-2 text-base text-gray-700">
              Start adding products to your wishlist to see them here.
            </p>
            <div className="mt-8">
              <Link href="/products">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item, index) => (
              <Card
                key={item.product._id}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Discount Badge */}
                {item.product.discount > 0 && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {item.product.discount}% OFF
                  </div>
                )}

                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                  <Image
                    src={
                      item.product.images?.[0]?.url || "/placeholder-ghee.jpg"
                    }
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Product Details */}
                <CardContent className="p-6 space-y-4">
                  {/* Product Name */}
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
                    {item.product.name}
                  </h3>

                  {/* Weight/Variant */}
                  <p className="text-sm text-gray-600 font-medium">
                    {item.product.type} - {item.product.size}
                  </p>

                  {/* Price Section */}
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

                  {/* Ratings */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.product.ratings || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      ({item.product.numOfReviews || 0})
                    </span>
                  </div>

                  {/* Short Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {item.product.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-3 relative z-10">
                    {/* Primary: Add to Cart */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(item.product);
                      }}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative z-20 flex items-center justify-center"
                      style={{ pointerEvents: "auto" }}
                      disabled={
                        !item.product.stock ||
                        item.product.stock === 0 ||
                        addingToCart === item.product._id
                      }
                    >
                      {addingToCart === item.product._id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {item.product.stock > 0
                            ? "Add to Cart"
                            : "Out of Stock"}
                        </>
                      )}
                    </button>

                    {/* Secondary and Tertiary Actions */}
                    <div className="flex gap-2 relative z-20">
                      {/* Secondary: View */}
                      <Link
                        href={`/products/${item.product._id}`}
                        className="flex-1"
                      >
                        <button
                          className="w-full font-medium hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-300 rounded-xl cursor-pointer border border-gray-300 bg-white px-4 py-2 flex items-center justify-center"
                          style={{ pointerEvents: "auto" }}
                        >
                          {/* <Eye className="w-4 h-4 mr-2" /> */}
                          View
                        </button>
                      </Link>

                      {/* Tertiary: Remove */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveFromWishlist(item.product._id);
                        }}
                        disabled={removingItem === item.product._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 min-w-[48px] cursor-pointer bg-transparent border-none p-2 flex items-center justify-center"
                        style={{ pointerEvents: "auto" }}
                      >
                        {removingItem === item.product._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
