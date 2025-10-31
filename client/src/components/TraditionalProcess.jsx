"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Flame, Droplets, Package, Heart } from "lucide-react";
import { useState } from "react";

const TraditionalProcess = () => {
  const [activeStep, setActiveStep] = useState(1);

  const processSteps = [
    {
      number: 1,
      title: "Milking with care",
      description:
        "A2 Desi cows are milked by hand, honoring ancient Ayurvedic traditions for purity and authenticity.",
      image: "/Image1.jpg",
      leftContent: {
        title: "Hand Milking Process",
        description:
          "Our farmers use traditional hand milking techniques, ensuring the milk retains its natural nutrients and purity.",
        icon: <Heart className="w-8 h-8 text-amber-600" />,
        image: "/Image1.jpg",
      },
    },
    {
      number: 2,
      title: "Heating Milk and Preparing Curd",
      description:
        "Heat A2 milk in a clay pot, add curd culture, and let it ferment into rich curd.",
      image: "/Image2.webp",
      leftContent: {
        title: "Traditional Clay Pot Method",
        description:
          "Milk is boiled in clay pots over firewood, then naturally fermented into curd using traditional methods.",
        icon: <Flame className="w-8 h-8 text-amber-600" />,
        image: "/Image2.webp",
      },
    },
    {
      number: 3,
      title: "Traditionally wood churned",
      description:
        "The curd is churned using a wooden bilona, extracting rich and wholesome butter.",
      image: "/Image3.jpeg",
      leftContent: {
        title: "Wooden Bilona Churning",
        description:
          "The curd is churned using traditional wooden bilona, a process that takes hours but ensures the finest quality butter.",
        icon: <Droplets className="w-8 h-8 text-amber-600" />,
        image: "/Image3.jpeg",
      },
    },
    {
      number: 4,
      title: "Slow Cooking the Butter",
      description:
        "This process evaporates water content and converts the butter into golden aromatic ghee, retaining all its nutritional properties.",
      image: "/Image4.jpg",
      leftContent: {
        title: "Slow Heat Transformation",
        description:
          "Butter is slowly heated to evaporate water content, transforming into golden aromatic ghee while preserving all nutrients.",
        icon: <Flame className="w-8 h-8 text-amber-600" />,
        image: "/Image4.jpg",
      },
    },
    {
      number: 5,
      title: "Filtering and Packaging",
      description:
        "Once cooled, the pure Bilona A2 Ghee is carefully packaged to preserve its freshness and rich aroma.",
      image: "/Image5.jpeg",
      leftContent: {
        title: "Pure Ghee Packaging",
        description:
          "The final ghee is filtered through muslin cloth and packaged in glass jars to maintain freshness and purity.",
        icon: <Package className="w-8 h-8 text-amber-600" />,
        image: "/Image5.jpeg",
      },
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-amber-100 relative overflow-hidden">
      <div className="absolute inset-0 tree-background"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-amber-600">The Traditional</span>
            <br />
            Journey of Our Ghee
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Discover the ancient art of ghee making, passed down through
            generations
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Side - Dynamic Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Active Step Content */}
            <motion.div
              key={activeStep}
              className="enhanced-main-card relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-300/20 to-yellow-300/20 rounded-full blur-xl"></div>

              <div className="relative z-10 p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <motion.div
                    className="enhanced-icon-container"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {processSteps[activeStep - 1]?.leftContent?.icon}
                  </motion.div>
                  <div>
                    <h3 className="enhanced-main-title">
                      {processSteps[activeStep - 1]?.leftContent?.title}
                    </h3>
                    <div className="enhanced-title-underline"></div>
                  </div>
                </div>

                <p className="enhanced-description">
                  {processSteps[activeStep - 1]?.leftContent?.description}
                </p>

                <motion.div
                  className="enhanced-image-container"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={
                      processSteps[activeStep - 1]?.leftContent?.image ||
                      "/placeholder-ghee.jpg"
                    }
                    alt={processSteps[activeStep - 1]?.leftContent?.title}
                    fill
                    className="object-cover"
                  />
                  <div className="enhanced-image-overlay"></div>
                  <div className="enhanced-image-border"></div>
                </motion.div>
              </div>
            </motion.div>

            {/* Process Overview */}
            <motion.div
              className="enhanced-overview-card relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Decorative pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/20 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white/20 rounded-full"></div>
              </div>

              <div className="relative z-10 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <h4 className="text-xl font-bold">
                    Traditional Process Overview
                  </h4>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>

                <div className="enhanced-overview-grid">
                  {processSteps.map((step, index) => (
                    <motion.div
                      key={step.number}
                      className={`enhanced-overview-item ${
                        activeStep === step.number ? "active" : ""
                      }`}
                      onClick={() => setActiveStep(step.number)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="enhanced-overview-number">
                        {step.number}
                      </div>
                      <div className="enhanced-overview-label">
                        {step.title.split(" ")[0].length > 8
                          ? step.title.split(" ")[0].substring(0, 8)
                          : step.title.split(" ")[0]}
                      </div>
                      {activeStep === step.number && (
                        <motion.div
                          className="enhanced-active-indicator"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Additional Info Card - Fills Empty Space */}
            <motion.div
              className="relative overflow-hidden rounded-3xl mt-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                background:
                  "linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(251, 191, 36, 0.05))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/10 to-amber-200/10 rounded-full blur-xl"></div>

              {/* Traditional Image Container */}
              <motion.div
                className="relative h-48 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/Image6.png"
                  alt="Traditional Ghee Making"
                  fill
                  className="object-cover"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                {/* Overlay decorative frame */}
                <div className="absolute inset-0 border-4 border-amber-300/50 rounded-t-3xl"></div>
                <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-white/20 rounded-3xl"></div>

                {/* Corner decorative elements */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-lg"></div>

                {/* Traditional symbol overlay */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                  <svg
                    className="w-8 h-8 text-amber-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />
                  </svg>
                </div>
              </motion.div>

              {/* Content Section */}
              <div className="relative z-10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl shadow-lg">
                    <svg
                      className="w-6 h-6 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">
                    Traditional Quality Guaranteed
                  </h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Our ghee is made using ancient Indian methods, passed down
                  through generations. Every batch undergoes strict quality
                  control to ensure purity and authenticity.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-200/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                      100%
                    </div>
                    <div className="text-xs text-gray-600">Pure A2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                      0
                    </div>
                    <div className="text-xs text-gray-600">Preservatives</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                      100%
                    </div>
                    <div className="text-xs text-gray-600">Natural</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Step Cards */}
          <div className="space-y-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                className={`enhanced-step-card ${
                  activeStep === step.number ? "active" : ""
                }`}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => setActiveStep(step.number)}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: index * 0.08,
                }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-100/30 to-amber-100/30 rounded-full blur-lg"></div>

                <div className="relative z-10 p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <motion.div
                      className={`enhanced-step-number ${
                        activeStep === step.number ? "active" : ""
                      }`}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.1 + 0.5,
                        type: "spring",
                        stiffness: 300,
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <span className="relative z-10 font-bold text-lg">
                        {step.number}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full opacity-20 animate-pulse"></div>
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`enhanced-step-title ${
                          activeStep === step.number ? "active" : ""
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="enhanced-step-description mb-4">
                        {step.description}
                      </p>

                      {/* Active indicator */}
                      {activeStep === step.number && (
                        <motion.div
                          className="mt-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-amber-600">
                              Currently viewing
                            </span>
                            <motion.div
                              className="w-1 h-1 bg-amber-400 rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <motion.div
                      className="enhanced-step-image flex-shrink-0"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.1 + 0.7,
                        type: "spring",
                        stiffness: 300,
                      }}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                    >
                      <Image
                        src={step.image}
                        alt={step.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                      <div className="enhanced-image-glow"></div>
                    </motion.div>
                  </div>

                  {/* Progress line */}
                  {index < processSteps.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gradient-to-b from-amber-200 to-transparent"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          className="enhanced-cta-section mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="relative z-10">
            <motion.h3
              className="text-3xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              Experience the Authentic Taste of Tradition
            </motion.h3>
            <motion.p
              className="text-amber-100 text-lg max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Every drop of our ghee carries the legacy of centuries-old
              methods, ensuring you get the purest and most nutritious ghee
              possible.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <Link href="/products">
                <motion.button
                  className="enhanced-cta-button-primary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Shop Our Ghee</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <motion.button
                className="enhanced-cta-button-secondary"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TraditionalProcess;
