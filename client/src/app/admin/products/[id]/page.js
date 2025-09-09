"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import {
  ArrowLeft,
  Edit,
  Package,
  Star,
  Calendar,
  Tag,
  Weight,
  DollarSign,
  BarChart3,
  Eye,
  Heart,
} from "lucide-react";
import RatingStars from "@/components/RatingStars";
import Link from "next/link";
import Image from "next/image";

export default function AdminProductView() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      router.push("/");
      return;
    }

    if (params.id) {
      fetchProduct();
    }
  }, [isAuthenticated, user, router, params.id]);

  const fetchProduct = async () => {
    try {
      const response = await adminAPI.getProductById(params.id);
      setProduct(response.data.product);
    } catch (error) {
      console.error("Product fetch error:", error);
      toast.error("Failed to load product");
      router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Product not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The product you are looking for does not exist.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/products"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Product Details
                </h1>
                <p className="text-gray-600">
                  View product information and analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Products
              </Link>
              <Link
                href={`/admin/products/${product._id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Product Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      No images available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Product Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SKU
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {product.sku}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{product.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Size
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{product.size}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pricing
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Price
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    ₹{product.price}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Original Price
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    ₹{product.originalPrice}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.discount}%
                  </p>
                </div>
              </div>
            </div>

            {/* Stock & Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Stock & Status
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Quantity
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {product.stock}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Featured
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.featured
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.featured ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Reviews & Ratings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Reviews & Ratings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  <RatingStars rating={product.ratings} className="h-5 w-5" />
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  {Number(product.ratings || 0).toFixed(1)}
                </span>
                <span className="ml-1 text-sm text-gray-500">
                  ({product.numOfReviews || 0} reviews)
                </span>
              </div>

              {product.reviews && product.reviews.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Recent Reviews</h3>
                  {product.reviews.slice(0, 3).map((review, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {review.name}
                        </span>
                        <div className="flex items-center">
                          <RatingStars
                            rating={review.rating}
                            className="h-3 w-3"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        {product.nutritionalInfo && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Nutritional Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 capitalize">{key}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Dates */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Important Dates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Manufacturing Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(product.manufacturingDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(product.expiryDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
