"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Truck,
  Shield,
  Leaf,
  Heart,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Package,
  Users,
  Award,
} from "lucide-react";
import RatingStars from "@/components/RatingStars";
import { productsAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import WishlistButton from "@/components/WishlistButton";
import ImageCarousel from "@/components/ImageCarousel";
import TraditionalProcess from "@/components/TraditionalProcess";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Handle image cycling on hover
  useEffect(() => {
    if (!hoveredProduct || !featuredProducts.length) return;

    const product = featuredProducts.find((p) => p._id === hoveredProduct);
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
  }, [hoveredProduct, featuredProducts]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const slideInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  // images
  const carouselImages = [
    "/hero-ghee.jpg",
    "/Ghee.jpg",
    "/Ghee1.jpg",
    "/Ghee2.jpg",
    "/Ghee3.jpg",
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getFeatured();
      setFeaturedProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    await addToCart(productId, 1);
  };

  const features = [
    {
      icon: <Truck className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />,
      title: "Free Shipping",
      description: "Free shipping on orders above ₹1000",
    },
    {
      icon: <Shield className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />,
      title: "Quality Guarantee",
      description: "100% pure and authentic ghee products",
    },
    {
      icon: <Leaf className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />,
      title: "Organic Certified",
      description: "Certified organic and natural ingredients",
    },
    {
      icon: <Package className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />,
      title: "Secure Packaging",
      description: "Safe and hygienic packaging",
    },
  ];

  const gheeTypes = [
    {
      name: "Pure Cow Ghee",
      description: "Traditional cow ghee made from A2 milk",
      image: "/cow-ghee.jpg",
      price: "₹450",
      originalPrice: "₹550",
      href: "/products?type=Pure Cow Ghee",
    },
    {
      name: "Buffalo Ghee",
      description: "Rich and creamy buffalo ghee",
      image: "/buffalo-ghee.jpg",
      price: "₹400",
      originalPrice: "₹500",
      href: "/products?type=Buffalo Ghee",
    },
    {
      name: "Organic Ghee",
      description: "Certified organic ghee from grass-fed cows",
      image: "/organic-ghee.jpg",
      price: "₹550",
      originalPrice: "₹650",
      href: "/products?type=Organic Ghee",
    },
    {
      name: "A2 Ghee",
      description: "Premium A2 ghee for better digestion",
      image: "/a2-ghee.jpg",
      price: "₹600",
      originalPrice: "₹700",
      href: "/products?type=A2 Ghee",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Home Chef",
      content:
        "The pure cow ghee has transformed my cooking. The aroma and taste are incredible!",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "Health Enthusiast",
      content:
        "I've been using their organic ghee for months. Great quality and authentic taste.",
      rating: 5,
    },
    {
      name: "Meera Patel",
      role: "Yoga Instructor",
      content:
        "Perfect for my Ayurvedic practices. The A2 ghee is exactly what I was looking for.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-100 py-8 md:py-12 lg:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-start min-h-[0] md:min-h-[520px] lg:min-h-[600px]">
            <motion.div
              className="space-y-4 md:space-y-6 lg:space-y-8 flex flex-col justify-start pt-2 md:pt-4 lg:pt-6"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div className="space-y-4" variants={fadeInUp}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-amber-700 bg-amber-100 animate-pulse"
                  >
                    Premium Quality Ghee
                  </Badge>
                </motion.div>
                <motion.h1
                  className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight"
                  variants={fadeInUp}
                >
                  <span className="block">Pure & Authentic</span>
                  <motion.span
                    className="text-amber-600 block"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Ghee Products
                  </motion.span>
                </motion.h1>
                <motion.p
                  className="text-base md:text-lg lg:text-xl text-gray-600 max-w-lg leading-relaxed"
                  variants={fadeInUp}
                >
                  Discover our premium collection of traditional ghee, sourced
                  from the finest farms and prepared using age-old methods.
                </motion.p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6"
                variants={fadeInUp}
              >
                <Link href="/products">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Button
                      size="lg"
                      className="bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300 hover:shadow-lg text-base md:text-lg px-6 md:px-8 py-3"
                    >
                      Shop Now
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/about">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="transition-all duration-300 hover:shadow-lg text-base md:text-lg px-6 md:px-8 py-3"
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-8 text-sm md:text-base lg:text-base text-gray-600"
                variants={fadeInUp}
              >
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                  <span>100% Pure</span>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                  <span>Organic Certified</span>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                  <span>Free Shipping</span>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative flex items-start justify-center lg:justify-end pt-3 md:pt-4 lg:pt-6"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                className="relative z-10 h-[260px] sm:h-[340px] md:h-[420px] lg:h-[520px] w-full max-w-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <ImageCarousel
                  images={carouselImages}
                  autoScroll={true}
                  interval={4000}
                  className="h-full w-full shadow-xl md:shadow-2xl"
                />
              </motion.div>
              <motion.div
                className="absolute -top-6 -right-6 w-36 h-36 bg-amber-200 rounded-full opacity-50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-6 -left-6 w-20 h-20 md:w-28 md:h-28 bg-orange-200 rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center space-y-2 md:space-y-4 group"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="flex justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm leading-tight">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ghee Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Premium Ghee Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully curated selection of premium ghee
              products
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {gheeTypes.map((type, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="product-card group h-full">
                  <div className="product-card-image">
                    <div className="relative overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <Image
                          src={type.image}
                          alt={type.name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover transition-transform duration-500"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div className="product-card-content">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300 mb-2">
                        {type.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <span className="product-price">{type.price}</span>
                        <span className="text-gray-400 line-through text-sm">
                          {type.originalPrice}
                        </span>
                      </div>
                    </div>
                    <Link href={type.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <button className="product-button w-full flex items-center justify-center space-x-2">
                          <span>View Products</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="pt-16 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Our most popular and highly-rated ghee products
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {featuredProducts.slice(0, 4).map((product, index) => (
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
                          <div className="relative w-full h-48 overflow-hidden">
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
                                className="w-full h-48 object-cover transition-transform duration-500"
                              />
                            )}
                          </div>
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {product.discount > 0 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: index * 0.1 + 0.5,
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
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300 mb-2 line-clamp-2">
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
                          <span className="product-price">
                            ₹{product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-gray-400 line-through text-sm">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
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
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <WishlistButton
                            productId={product._id}
                            className="wishlist-button"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/products">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="transition-all duration-300 hover:shadow-lg"
                >
                  View All Products
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
      <TraditionalProcess />

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Do not just take our word for it - hear from our satisfied
              customers
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="text-center h-full group">
                  <CardContent className="p-6">
                    <motion.div
                      className="flex justify-center mb-4"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: -20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 + i * 0.1 + 0.7 }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="text-gray-600 mb-4 italic group-hover:text-gray-800 transition-colors duration-300">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              { number: "10K+", label: "Happy Customers" },
              { number: "50+", label: "Product Varieties" },
              { number: "100%", label: "Pure Quality" },
              { number: "24/7", label: "Customer Support" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-white"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-3xl font-bold mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1 + 0.3,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-amber-100">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Experience Premium Ghee?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of customers who trust us for their daily ghee
              needs
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/products">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300 hover:shadow-lg"
                  >
                    Start Shopping
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-black border-white hover:bg-gray-200 transition-all duration-300 hover:shadow-lg"
                  >
                    Contact Us
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
