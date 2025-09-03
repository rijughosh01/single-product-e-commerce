'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import WishlistButton from './WishlistButton';
import { 
  ShoppingCart, 
  Package, 
  Star,
  Heart,
  Truck,
  Shield,
  Leaf,
  Zap,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product._id, 1);
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-600' };
    if (product.stock <= 5) return { text: 'Low Stock', color: 'bg-orange-500', textColor: 'text-orange-600' };
    return { text: 'In Stock', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const stockStatus = getStockStatus();

  return (
    <Card 
      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {product.discount > 0 && (
        <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-0 px-3 py-1 rounded-full text-xs font-semibold">
          <Zap className="w-3 h-3 mr-1" />
          {product.discount}% OFF
        </Badge>
      )}

      {/* Stock Status Badge */}
      <Badge className={`absolute top-4 right-4 z-10 ${stockStatus.color} text-white shadow-lg border-0 px-3 py-1 rounded-full text-xs font-semibold`}>
        <Package className="w-3 h-3 mr-1" />
        {stockStatus.text}
      </Badge>

      {/* Wishlist Button */}
      <div className="absolute top-4 right-16 z-10">
        <WishlistButton productId={product._id} />
      </div>

      {/* Image Container */}
      <CardHeader className="pb-0 p-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <Link href={`/products/${product._id}`}>
            <Image
              src={product.images?.[0]?.url || '/placeholder-ghee.jpg'}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          </Link>
          
          {/* Overlay with Quick View */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Link href={`/products/${product._id}`}>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/90 hover:bg-white text-gray-800 font-medium px-4 py-2 rounded-full shadow-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Quick View
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom Gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pb-4 pt-6 px-6">
        {/* Product Type Badge */}
        <div className="mb-3">
          <Badge variant="outline" className="text-xs font-medium text-amber-600 border-amber-200 bg-amber-50">
            {product.type}
          </Badge>
        </div>

        {/* Product Name */}
        <Link href={`/products/${product._id}`}>
          <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-amber-600 transition-colors leading-tight">
            {product.name}
          </CardTitle>
        </Link>

        {/* Size Info */}
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
            {product.size}
          </Badge>
        </div>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.ratings || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">({product.numOfReviews || 0})</span>
        </div>

        {/* Price Section */}
        <div className="mt-4 flex items-end gap-3">
          <span className="text-2xl font-bold tracking-tight text-gray-900">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Features */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Quality Assured</span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="pt-0 px-6 pb-6">
        <Button
          onClick={handleAddToCart}
          className={`w-full font-semibold py-3 rounded-xl transition-all duration-300 ${
            product.stock > 0 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!product.stock || product.stock === 0 || addingToCart}
        >
          {addingToCart ? (
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              Adding...
            </div>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </>
          )}
        </Button>
      </CardFooter>

      {/* Hover Effect Border */}
      <div className={`absolute inset-0 border-2 border-amber-500/20 rounded-2xl transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </Card>
  );
};

export default ProductCard;
