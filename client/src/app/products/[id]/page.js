"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  Package,
  ChevronLeft,
  Plus,
  Minus,
  CheckCircle,
  Calendar,
  Weight,
  Leaf,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Whatsapp,
  Mail,
  StarHalf,
} from "lucide-react";
import { productsAPI } from "@/lib/api";
import RatingStars from "@/components/RatingStars";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import WishlistButton from "@/components/WishlistButton";
import Link from "next/link";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sort, setSort] = useState("recent");
  const [pageSize, setPageSize] = useState(10);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const renderStars = (rating, sizeClass = "w-5 h-5") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const threshold = i - 0.5;
      if (rating >= i) {
        stars.push(
          <Star
            key={i}
            className={`${sizeClass} text-yellow-400 fill-current`}
          />
        );
      } else if (rating >= threshold) {
        stars.push(
          <StarHalf
            key={i}
            className={`${sizeClass} text-yellow-400 fill-current`}
          />
        );
      } else {
        stars.push(<Star key={i} className={`${sizeClass} text-gray-300`} />);
      }
    }
    return stars;
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest(".share-menu-container")) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareMenu]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (reviewRating < 1 || reviewRating > 5 || !reviewComment.trim()) return;
    setSubmitting(true);
    try {
      await productsAPI.addReview({
        rating: reviewRating,
        comment: reviewComment,
        productId: product._id,
      });
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment("");
      await fetchProduct();
    } catch (e) {
      console.error("Failed to submit review", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    await addToCart(product._id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    await addToCart(product._id, quantity);
    router.push("/checkout");
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Share functionality
  const getShareData = () => {
    const url = `${window.location.origin}/products/${product._id}`;
    const title = `${product.name} - Pure Ghee Store`;
    const text = `Check out this amazing ${
      product.name
    } from Pure Ghee Store! ${product.description?.substring(0, 100)}...`;

    return { url, title, text };
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const { url, title, text } = getShareData();
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      const { url } = getShareData();

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setShareCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setShareCopied(false), 2000);
      setShowShareMenu(false);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const shareToSocial = (platform) => {
    const { url, title, text } = getShareData();
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(
          `${text} ${url}`
        )}`;
        break;
      case "instagram":
        copyToClipboard();
        toast.success("Link copied for Instagram!");
        return;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
    toast.success(`Opening ${platform}...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you are looking for does not exist
          </p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Truck className="w-6 h-6 text-amber-500" />,
      title: "Free Shipping",
      description: "On orders above ₹500",
    },
    {
      icon: <Shield className="w-6 h-6 text-amber-500" />,
      title: "Quality Guarantee",
      description: "100% pure and authentic",
    },
    {
      icon: <Package className="w-6 h-6 text-amber-500" />,
      title: "Secure Packaging",
      description: "Safe and hygienic",
    },
    {
      icon: <Leaf className="w-6 h-6 text-amber-500" />,
      title: "Organic Certified",
      description: "Natural ingredients",
    },
  ];

  // Derived reviews view
  const sortedAndSlicedReviews = (() => {
    const list = Array.isArray(product?.reviews) ? [...product.reviews] : [];
    if (sort === "top") {
      list.sort((a, b) => {
        const r = Number(b.rating || 0) - Number(a.rating || 0);
        if (r !== 0) return r;
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
    } else {
      list.sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
    }
    return list.slice(0, pageSize);
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-amber-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-amber-600">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Product Images */}
          <motion.div className="space-y-4" variants={fadeInUp}>
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full cursor-zoom-in"
              >
                <Image
                  src={
                    product.images?.[selectedImage]?.url ||
                    "/placeholder-ghee.jpg"
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              {product.discount > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute top-4 left-4"
                >
                  <span className="product-badge">{product.discount}% OFF</span>
                </motion.div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-amber-500"
                        : "border-gray-200"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Image
                      src={image?.url || "/placeholder-ghee.jpg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="space-y-6 lg:sticky lg:top-24"
            variants={fadeInUp}
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <RatingStars rating={product.ratings} className="w-5 h-5" />
                  <span className="text-sm text-gray-600 ml-1">
                    ({product.numOfReviews} reviews)
                  </span>
                </div>
                <Badge variant="outline">{product.type}</Badge>
                <Badge variant="outline">{product.size}</Badge>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-amber-600">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              {product.discount > 0 && (
                <Badge className="bg-green-100 text-green-800">
                  Save ₹{product.originalPrice - product.price}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Weight className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Weight: {product.weight}g
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Expires: {new Date(product.expiryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  SKU: {product.sku}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Stock: {product.stock} available
                </span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center space-x-2 border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700 rounded-full h-12 text-base"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-full h-12 text-base"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  Buy Now
                </Button>
                <WishlistButton productId={product._id} size="default" />
                <div className="relative share-menu-container">
                  <Button
                    variant="outline"
                    onClick={handleNativeShare}
                    className="relative"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>

                  {/* Share Menu Dropdown */}
                  {showShareMenu && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Share this product
                        </h4>
                        <div className="space-y-2">
                          <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>{shareCopied ? "Copied!" : "Copy Link"}</span>
                          </button>
                          <button
                            onClick={() => shareToSocial("facebook")}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Facebook className="w-4 h-4 text-blue-600" />
                            <span>Share on Facebook</span>
                          </button>
                          <button
                            onClick={() => shareToSocial("twitter")}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Twitter className="w-4 h-4 text-blue-400" />
                            <span>Share on Twitter</span>
                          </button>
                          <button
                            onClick={() => shareToSocial("whatsapp")}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Whatsapp className="w-4 h-4 text-green-500" />
                            <span>Share on WhatsApp</span>
                          </button>
                          <button
                            onClick={() => shareToSocial("instagram")}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Instagram className="w-4 h-4 text-pink-500" />
                            <span>Copy for Instagram</span>
                          </button>
                          <button
                            onClick={() => shareToSocial("email")}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>Share via Email</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="mt-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "description", label: "Description" },
                { id: "nutritional", label: "Nutritional Info" },
                { id: "reviews", label: "Reviews" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Key Features
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>100% Pure and Natural</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Traditional Preparation Method</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>No Artificial Additives</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Rich in Essential Nutrients</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Storage Instructions
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>Store in a cool, dry place</li>
                      <li>Keep away from direct sunlight</li>
                      <li>Refrigerate after opening</li>
                      <li>Use within 6 months of opening</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "nutritional" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Nutritional Information
                  </h4>
                  <div className="space-y-3">
                    {product.nutritionalInfo &&
                      Object.entries(product.nutritionalInfo).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b border-gray-100"
                          >
                            <span className="capitalize text-gray-600">
                              {key}
                            </span>
                            <span className="font-medium">{value}g</span>
                          </div>
                        )
                      )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Health Benefits
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Rich in healthy fats and vitamins</li>
                    <li>• Supports digestive health</li>
                    <li>• Boosts immunity</li>
                    <li>• Promotes healthy skin</li>
                    <li>• Good for brain function</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                  <h4 className="font-semibold text-gray-900 text-xl">
                    Customer Reviews
                  </h4>
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Write a Review
                  </Button>
                </div>

                {/* Rating Summary */}
                {product.reviews && product.reviews.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="lg:col-span-1">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <div className="text-5xl font-bold text-gray-900 leading-none">
                            {Number(product.ratings || 0).toFixed(1)}
                          </div>
                          <div className="mt-2 flex items-center space-x-1">
                            <RatingStars
                              rating={product.ratings}
                              className="w-5 h-5"
                            />
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Based on {product.reviews.length} reviews
                          </div>
                        </div>
                        <div className="hidden sm:block w-px h-16 bg-gray-200" />
                        <div className="flex flex-col items-end">
                          <Badge
                            variant="outline"
                            className="text-green-700 bg-green-50"
                          >
                            Verified
                          </Badge>
                          <span className="mt-2 text-xs text-gray-500">
                            Updated {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                      <CardContent className="p-6 space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = product.reviews.filter(
                            (r) => Number(r.rating) === star
                          ).length;
                          const percent = product.reviews.length
                            ? Math.round((count / product.reviews.length) * 100)
                            : 0;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <div className="w-6 text-sm text-gray-700">
                                {star}
                              </div>
                              <Star className="w-4 h-4 text-yellow-500" />
                              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r from-amber-400 to-amber-600`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <div className="w-10 text-right text-sm text-gray-600">
                                {count}
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                )}
                {/* Controls */}
                {product.reviews && product.reviews.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Sort</span>
                      <select
                        className="border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        onChange={(e) => setSort(e.target.value)}
                        value={sort}
                      >
                        <option value="recent">Most recent</option>
                        <option value="top">Top rated</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Show</span>
                      <select
                        className="border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        value={pageSize}
                      >
                        {[5, 10, 20, 50, 100].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {showReviewForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
                      <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h5 className="font-semibold text-gray-900">
                          Write a review
                        </h5>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-2">
                            Your Rating
                          </span>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setReviewRating(i)}
                              >
                                <Star
                                  className={`w-7 h-7 ${
                                    i <= reviewRating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review
                          </span>
                          <textarea
                            className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            rows="5"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience..."
                          />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowReviewForm(false)}
                            className="rounded-full"
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-amber-600 hover:bg-amber-700 rounded-full"
                            onClick={submitReview}
                            disabled={
                              submitting ||
                              reviewRating === 0 ||
                              !reviewComment.trim()
                            }
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {sortedAndSlicedReviews.map((review, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold">
                                {review.name
                                  ?.split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-gray-900">
                                    {review.name}
                                  </h5>
                                  <span className="text-xs text-gray-500">
                                    Verified Buyer
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <RatingStars
                                    rating={review.rating}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.createdAt
                                ? new Date(
                                    review.createdAt
                                  ).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white rounded-lg border">
                    <p className="text-gray-700 mb-2 font-medium">
                      No reviews yet
                    </p>
                    <p className="text-gray-500 mb-4">
                      Be the first to share your thoughts on this product.
                    </p>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700 rounded-full"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
