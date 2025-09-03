'use client';

import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Package, 
  Star,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const WishlistPage = () => {
  const { wishlist, loading, error, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [removingItem, setRemovingItem] = useState(null);
  const [clearingWishlist, setClearingWishlist] = useState(false);

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItem(productId);
    await removeFromWishlist(productId);
    setRemovingItem(null);
  };

  const handleAddToCart = async (product) => {
    await addToCart(product._id, 1);
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      setClearingWishlist(true);
      await clearWishlist();
      setClearingWishlist(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Please login to view your wishlist</h2>
            <p className="mt-2 text-sm text-gray-500">
              You need to be logged in to access your wishlist.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
            <p className="mt-2 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="mt-2 text-gray-600">
                {wishlist.length === 0 
                  ? "Your wishlist is empty" 
                  : `${wishlist.length} item${wishlist.length === 1 ? '' : 's'} in your wishlist`
                }
              </p>
            </div>
            {wishlist.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                disabled={clearingWishlist}
                className="text-red-600 border-red-200 hover:bg-red-50"
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 && !loading && (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-2 text-sm text-gray-500">
              Start adding products to your wishlist to see them here.
            </p>
            <div className="mt-6">
              <Link href="/products">
                <Button>
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
            {wishlist.map((item) => (
              <Card key={item.product._id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {item.product.discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        -{item.product.discount}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {item.product.name}
                  </CardTitle>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.product.ratings || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({item.product.numOfReviews || 0})
                    </span>
                  </div>

                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{item.product.price}
                    </span>
                    {item.product.originalPrice > item.product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{item.product.originalPrice}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {item.product.description}
                  </p>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="w-full space-y-2">
                    <Button
                      onClick={() => handleAddToCart(item.product)}
                      className="w-full"
                      disabled={!item.product.stock || item.product.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveFromWishlist(item.product._id)}
                      disabled={removingItem === item.product._id}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {removingItem === item.product._id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Remove
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
