"use client";

import Link from "next/link";
import {
  Package,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const Footer = () => {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 200,
      },
    },
  };

  return (
    <footer className="bg-gray-900 text-white" ref={footerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Company Info */}
          <motion.div className="space-y-4" variants={itemVariants}>
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
              We bring you the finest quality ghee products, sourced from the
              best farms and prepared using traditional methods.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="text-gray-400 hover:text-amber-500 transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-amber-500 transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-amber-500 transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-amber-500 transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Youtube className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?type=Pure Cow Ghee"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Pure Cow Ghee
                </Link>
              </li>
              <li>
                <Link
                  href="/products?type=Buffalo Ghee"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Buffalo Ghee
                </Link>
              </li>
              <li>
                <Link
                  href="/products?type=Organic Ghee"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Organic Ghee
                </Link>
              </li>
              <li>
                <Link
                  href="/products?type=A2 Ghee"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  A2 Ghee
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm">
                    123 Ghee Street,
                    <br />
                    Traditional Village,
                    <br />
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
              <motion.div
                className="flex"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:border-amber-500 text-white placeholder-gray-400"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-r-md hover:bg-amber-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="border-t border-gray-800 mt-8 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Pure Ghee. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <motion.img
                src="/visa.png"
                alt="Visa"
                className="h-6 opacity-60"
                whileHover={{ scale: 1.2, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.img
                src="/mastercard.png"
                alt="Mastercard"
                className="h-6 opacity-60"
                whileHover={{ scale: 1.2, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.img
                src="/paypal.png"
                alt="PayPal"
                className="h-6 opacity-60"
                whileHover={{ scale: 1.2, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.img
                src="/razorpay.png"
                alt="Razorpay"
                className="h-6 opacity-60"
                whileHover={{ scale: 1.2, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
