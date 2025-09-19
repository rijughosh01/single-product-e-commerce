"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

// Animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const slideInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const AnimationWrapper = ({
  children,
  variant = fadeInUp,
  delay = 0,
  className = "",
  once = true,
  margin = "-100px",
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin });

  return (
    <motion.div
      ref={ref}
      initial={variant.initial}
      animate={isInView ? variant.animate : variant.initial}
      transition={{ ...variant.transition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hover animation wrapper
export const HoverWrapper = ({
  children,
  scale = 1.05,
  y = -5,
  className = "",
  transition = { type: "spring", stiffness: 300 },
}) => {
  return (
    <motion.div
      whileHover={{ scale, y }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Button animation wrapper
export const ButtonWrapper = ({
  children,
  className = "",
  whileHover = { scale: 1.05 },
  whileTap = { scale: 0.95 },
  transition = { type: "spring", stiffness: 300 },
}) => {
  return (
    <motion.div
      whileHover={whileHover}
      whileTap={whileTap}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Floating animation wrapper
export const FloatingWrapper = ({
  children,
  className = "",
  duration = 3,
  delay = 0,
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation wrapper
export const PulseWrapper = ({
  children,
  className = "",
  scale = [1, 1.05, 1],
  duration = 2,
  delay = 0,
}) => {
  return (
    <motion.div
      animate={{ scale }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Shimmer effect wrapper
export const ShimmerWrapper = ({ children, className = "", duration = 2 }) => {
  return (
    <motion.div
      animate={{
        backgroundPosition: ["-200% 0", "200% 0"],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
      className={`bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimationWrapper;
