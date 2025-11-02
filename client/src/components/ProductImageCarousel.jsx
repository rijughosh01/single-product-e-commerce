"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const ProductImageCarousel = ({
  images = [],
  autoScroll = true,
  interval = 5000,
  className = "",
  onImageChange = () => {},
  currentIndex = 0,
  setCurrentIndex = () => {},
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const lensSize = 200;
  const zoomLevel = 2.5;

  useEffect(() => {
    if (!autoScroll || images.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
        onImageChange(newIndex);
        return newIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [
    autoScroll,
    interval,
    images.length,
    isPaused,
    setCurrentIndex,
    onImageChange,
  ]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    onImageChange(index);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onImageChange(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    onImageChange(newIndex);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!imageRef.current || !showZoom) return;

      const rect = imageRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      const percentageX = (x / rect.width) * 100;
      const percentageY = (y / rect.height) * 100;

      const halfLens = lensSize / 2;
      let lensX = x - halfLens;
      let lensY = y - halfLens;

      // Constrain lens position to stay within image boundaries
      lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
      lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

      setMousePosition({ x, y });
      setLensPosition({ x: lensX, y: lensY });
      setZoomPosition({ x: percentageX, y: percentageY });
    },
    [showZoom, lensSize]
  );

  const handleMouseEnter = useCallback(() => {
    setShowZoom(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowZoom(false);
  }, []);

  if (images.length === 0) return null;

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Image Container */}
      <div
        className={`relative w-full h-full ${showZoom ? "cursor-none" : ""}`}
        ref={imageRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100, scale: 1.1 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`Product Image ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 ease-out"
              priority={currentIndex === 0}
              style={{
                transform: showZoom ? `scale(${zoomLevel})` : "scale(1)",
                transformOrigin: showZoom
                  ? `${zoomPosition.x}% ${zoomPosition.y}%`
                  : "center center",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {!showZoom && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        {showZoom && (
          <>
            {/* Main Magnifying Glass */}
            <motion.div
              className="absolute pointer-events-none z-50"
              style={{
                left: `${lensPosition.x}px`,
                top: `${lensPosition.y}px`,
                width: `${lensSize}px`,
                height: `${lensSize}px`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="relative w-full h-full rounded-full border-4 border-white shadow-[0_0_0_3px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.3)] bg-white/10 backdrop-blur-sm overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${images[currentIndex]})`,
                    backgroundSize: `${zoomLevel * 100}%`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
            </motion.div>

            {/* Custom Cursor Indicator */}
            <motion.div
              className="absolute pointer-events-none z-50"
              style={{
                left: `${mousePosition.x}px`,
                top: `${mousePosition.y}px`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              <div className="relative">
                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg border border-amber-500" />

                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-white/80" />
                <div className="absolute -translate-x-1/2 -translate-y-1/2 h-8 w-px bg-white/80" />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <motion.button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <motion.button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white scale-125 shadow-lg"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoScroll && images.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-white/80"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: interval / 1000, ease: "linear" }}
            key={currentIndex}
          />
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;
