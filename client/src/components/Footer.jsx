import Link from 'next/link';
import { Package, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pure Ghee</h3>
                <p className="text-sm text-gray-400">Premium Quality</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              We bring you the finest quality ghee products, sourced from the best farms and prepared using traditional methods.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?type=Pure Cow Ghee" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Pure Cow Ghee
                </Link>
              </li>
              <li>
                <Link href="/products?type=Buffalo Ghee" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Buffalo Ghee
                </Link>
              </li>
              <li>
                <Link href="/products?type=Organic Ghee" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Organic Ghee
                </Link>
              </li>
              <li>
                <Link href="/products?type=A2 Ghee" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  A2 Ghee
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm">
                    123 Ghee Street,<br />
                    Traditional Village,<br />
                    India - 123456
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-500" />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-500" />
                <span className="text-gray-400 text-sm">info@pureghee.com</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-2">Newsletter</h4>
              <p className="text-gray-400 text-xs mb-3">
                Subscribe to get updates on new products and offers
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:border-amber-500 text-white placeholder-gray-400"
                />
                <button className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-r-md hover:bg-amber-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Pure Ghee. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <img src="/visa.png" alt="Visa" className="h-6 opacity-60" />
              <img src="/mastercard.png" alt="Mastercard" className="h-6 opacity-60" />
              <img src="/paypal.png" alt="PayPal" className="h-6 opacity-60" />
              <img src="/razorpay.png" alt="Razorpay" className="h-6 opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
