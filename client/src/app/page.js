'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Award
} from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getFeatured();
      setFeaturedProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    await addToCart(productId, 1);
  };

  const features = [
    {
      icon: <Truck className="w-8 h-8 text-amber-500" />,
      title: "Free Shipping",
      description: "Free shipping on orders above ₹500"
    },
    {
      icon: <Shield className="w-8 h-8 text-amber-500" />,
      title: "Quality Guarantee",
      description: "100% pure and authentic ghee products"
    },
    {
      icon: <Leaf className="w-8 h-8 text-amber-500" />,
      title: "Organic Certified",
      description: "Certified organic and natural ingredients"
    },
    {
      icon: <Package className="w-8 h-8 text-amber-500" />,
      title: "Secure Packaging",
      description: "Safe and hygienic packaging"
    }
  ];

  const gheeTypes = [
    {
      name: "Pure Cow Ghee",
      description: "Traditional cow ghee made from A2 milk",
      image: "/cow-ghee.jpg",
      price: "₹450",
      originalPrice: "₹550",
      href: "/products?type=Pure Cow Ghee"
    },
    {
      name: "Buffalo Ghee",
      description: "Rich and creamy buffalo ghee",
      image: "/buffalo-ghee.jpg",
      price: "₹400",
      originalPrice: "₹500",
      href: "/products?type=Buffalo Ghee"
    },
    {
      name: "Organic Ghee",
      description: "Certified organic ghee from grass-fed cows",
      image: "/organic-ghee.jpg",
      price: "₹550",
      originalPrice: "₹650",
      href: "/products?type=Organic Ghee"
    },
    {
      name: "A2 Ghee",
      description: "Premium A2 ghee for better digestion",
      image: "/a2-ghee.jpg",
      price: "₹600",
      originalPrice: "₹700",
      href: "/products?type=A2 Ghee"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Home Chef",
      content: "The pure cow ghee has transformed my cooking. The aroma and taste are incredible!",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "Health Enthusiast",
      content: "I've been using their organic ghee for months. Great quality and authentic taste.",
      rating: 5
    },
    {
      name: "Meera Patel",
      role: "Yoga Instructor",
      content: "Perfect for my Ayurvedic practices. The A2 ghee is exactly what I was looking for.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-amber-700 bg-amber-100">
                  Premium Quality Ghee
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Pure & Authentic
                  <span className="text-amber-600 block">Ghee Products</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  Discover our premium collection of traditional ghee, sourced from the finest farms and prepared using age-old methods.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Shop Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>100% Pure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Organic Certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
        <Image
                  src="/hero-ghee.jpg"
                  alt="Premium Ghee Collection"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-amber-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange-200 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ghee Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Premium Ghee Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully curated selection of premium ghee products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gheeTypes.map((type, index) => (
              <Card key={index} className="card-hover group">
                <CardHeader className="pb-4">
                  <div className="relative overflow-hidden rounded-lg mb-4">
            <Image
                      src={type.image}
                      alt={type.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{type.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-amber-600">{type.price}</span>
                      <span className="text-gray-400 line-through">{type.originalPrice}</span>
                    </div>
                  </div>
                  <Link href={type.href}>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                      View Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Our most popular and highly-rated ghee products
            </p>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <Card key={product._id} className="card-hover group">
                  <CardHeader className="pb-4">
                    <div className="relative overflow-hidden rounded-lg mb-4">
          <Image
                        src={product.images[0]?.url || '/placeholder-ghee.jpg'}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          {product.discount}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.ratings)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        ({product.numOfReviews})
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-amber-600">
                          ₹{product.price}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-gray-400 line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                        onClick={() => handleAddToCart(product._id)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">10K+</div>
              <div className="text-amber-100">Happy Customers</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-amber-100">Product Varieties</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-amber-100">Pure Quality</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-amber-100">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Experience Premium Ghee?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust us for their daily ghee needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                Start Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
