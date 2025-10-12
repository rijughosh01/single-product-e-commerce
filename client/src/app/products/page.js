"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  Grid,
  List,
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import RatingStars from "@/components/RatingStars";
import { productsAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import WishlistButton from "@/components/WishlistButton";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const debouncedSearchQuery = useMemo(() => searchQuery, [searchQuery]);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  // Handle image cycling on hover
  useEffect(() => {
    if (!hoveredProduct || !filteredProducts.length) return;

    const product = filteredProducts.find((p) => p._id === hoveredProduct);
    if (!product || !product.images || product.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => ({
        ...prev,
        [hoveredProduct]:
          (prev[hoveredProduct] || 0) === product.images.length - 1
            ? 0
            : (prev[hoveredProduct] || 0) + 1,
      }));
    }, 900);

    return () => clearInterval(interval);
  }, [hoveredProduct, filteredProducts]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    const type = searchParams.get("type");
    if (type) {
      setSelectedType(type);
    }
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          product.type
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter((product) => product.type === selectedType);
    }

    if (selectedSize) {
      filtered = filtered.filter((product) => product.size === selectedSize);
    }

    // Price range filter
    if (minPrice > 0) {
      filtered = filtered.filter(
        (product) => Number(product.price) >= Number(minPrice)
      );
    }
    if (maxPrice > 0) {
      filtered = filtered.filter(
        (product) => Number(product.price) <= Number(maxPrice)
      );
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(
        (product) => Number(product.ratings || 0) >= Number(minRating)
      );
    }

    // Stock and discount filters
    if (inStockOnly) {
      filtered = filtered.filter((product) => Number(product.stock || 0) > 0);
    }
    if (discountOnly) {
      filtered = filtered.filter(
        (product) => Number(product.discount || 0) > 0
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => b.ratings - a.ratings);
        break;
      case "featured":
      default:
        filtered.sort((a, b) => b.featured - a.featured);
        break;
    }

    setFilteredProducts(filtered);
  }, [
    products,
    debouncedSearchQuery,
    selectedType,
    selectedSize,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    discountOnly,
    sortBy,
  ]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    await addToCart(productId, 1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedSize("");
    setSortBy("featured");
    setMinPrice(0);
    setMaxPrice(0);
    setMinRating(0);
    setInStockOnly(false);
    setDiscountOnly(false);
  };

  const gheeTypes = [
    "Pure Cow Ghee",
    "Buffalo Ghee",
    "Mixed Ghee",
    "Organic Ghee",
    "A2 Ghee",
  ];
  const sizes = ["250g", "500g", "1kg", "2kg", "5kg"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <Card key={index}>
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Our Products
          </h1>
          <p className="text-gray-600">
            Discover our premium collection of authentic ghee products
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur rounded-xl shadow-md border border-amber-100 p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 rounded-full border-amber-200 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* View Mode and Filters Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 border border-amber-200 rounded-full p-1 bg-amber-50/40">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded-full transition-colors ${
                    viewMode === "grid"
                      ? "bg-amber-600 text-white shadow"
                      : "text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-full transition-colors ${
                    viewMode === "list"
                      ? "bg-amber-600 text-white shadow"
                      : "text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-6 pt-6 border-t border-amber-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghee Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Types</option>
                    {gheeTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Sizes</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="rounded-lg border-amber-200 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="rounded-lg border-amber-200 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={0}>Any</option>
                    <option value={1}>1+</option>
                    <option value={2}>2+</option>
                    <option value={3}>3+</option>
                    <option value={4}>4+</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="flex flex-col gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="accent-amber-600"
                    />
                    In stock only
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={discountOnly}
                      onChange={(e) => setDiscountOnly(e.target.checked)}
                      className="accent-amber-600"
                    />
                    Discounted only
                  </label>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Active filters chips */}
              <div className="flex flex-wrap gap-2 mt-6">
                {selectedType && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    Type: {selectedType}
                    <button
                      type="button"
                      aria-label="Remove type filter"
                      onClick={() => setSelectedType("")}
                      className="hover:text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedSize && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    Size: {selectedSize}
                    <button
                      type="button"
                      aria-label="Remove size filter"
                      onClick={() => setSelectedSize("")}
                      className="hover:text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {minPrice > 0 && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    Min ₹{minPrice}
                    <button
                      type="button"
                      aria-label="Remove min price filter"
                      onClick={() => setMinPrice(0)}
                      className="hover:text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {maxPrice > 0 && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    Max ₹{maxPrice}
                    <button
                      type="button"
                      aria-label="Remove max price filter"
                      onClick={() => setMaxPrice(0)}
                      className="hover:text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    Rating {minRating}+
                    <button
                      type="button"
                      aria-label="Remove rating filter"
                      onClick={() => setMinRating(0)}
                      className="hover:text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {inStockOnly && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    In stock
                    <button
                      type="button"
                      aria-label="Remove in stock filter"
                      onClick={() => setInStockOnly(false)}
                      className="hover:text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {discountOnly && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    Discounted
                    <button
                      type="button"
                      aria-label="Remove discounted filter"
                      onClick={() => setDiscountOnly(false)}
                      className="hover:text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        ) : (
          <motion.div
            className={`grid gap-8 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="product-card group h-full"
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="product-card-image">
                    <div className="relative overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <div
                          className={`relative w-full overflow-hidden ${
                            viewMode === "grid" ? "h-48" : "h-32"
                          }`}
                        >
                          {product.images && product.images.length > 0 ? (
                            product.images.map((image, imgIndex) => (
                              <Image
                                key={imgIndex}
                                src={image?.url || "/placeholder-ghee.jpg"}
                                alt={product.name}
                                width={300}
                                height={200}
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                                  imgIndex ===
                                  (currentImageIndex[product._id] || 0)
                                    ? "opacity-100 translate-x-0"
                                    : imgIndex <
                                      (currentImageIndex[product._id] || 0)
                                    ? "opacity-0 -translate-x-full"
                                    : "opacity-0 translate-x-full"
                                }`}
                              />
                            ))
                          ) : (
                            <Image
                              src="/placeholder-ghee.jpg"
                              alt={product.name}
                              width={300}
                              height={200}
                              className={`w-full object-cover transition-transform duration-500 ${
                                viewMode === "grid" ? "h-48" : "h-32"
                              }`}
                            />
                          )}
                        </div>
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {Number(product.discount || 0) > 0 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: index * 0.1 + 0.3,
                            type: "spring",
                            stiffness: 300,
                          }}
                          className="absolute top-3 right-3"
                        >
                          <span className="product-badge">
                            {product.discount}% OFF
                          </span>
                        </motion.div>
                      )}
                      <div className="absolute top-3 left-3">
                        <WishlistButton
                          productId={product._id}
                          className="wishlist-button"
                        />
                      </div>

                      {/* Image Indicators */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
                          {product.images.map((_, imgIndex) => (
                            <div
                              key={imgIndex}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                imgIndex ===
                                (currentImageIndex[product._id] || 0)
                                  ? "bg-white scale-125 shadow-lg"
                                  : "bg-white/50 hover:bg-white/75"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="product-card-content">
                    <div className="mb-4">
                      <h3
                        className={`text-lg font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300 mb-2 ${
                          viewMode === "list" ? "text-xl" : ""
                        } line-clamp-2`}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-1 mb-3">
                        <RatingStars
                          rating={product.ratings}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600 ml-1">
                          ({product.numOfReviews})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <span className="product-price">₹{product.price}</span>
                        {Number(product.originalPrice) >
                          Number(product.price) && (
                          <span className="text-gray-400 line-through text-sm">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>
                    {viewMode === "list" && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex-1"
                      >
                        <button
                          className="product-button w-full flex items-center justify-center space-x-2"
                          onClick={() => handleAddToCart(product._id)}
                          disabled={Number(product.stock || 0) === 0}
                        >
                          <span>
                            {Number(product.stock || 0) === 0
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </span>
                        </button>
                      </motion.div>
                      <Link href={`/products/${product._id}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <button className="product-button px-4">View</button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
