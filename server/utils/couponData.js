const dotenv = require("dotenv");
const Coupon = require("../models/Coupon");
const connectDB = require("../config/database");

// Load environment variables
dotenv.config();

const couponData = [
  {
    code: "WELCOME10",
    description: "Welcome discount for new customers",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderAmount: 200,
    maximumDiscount: 100,
    usageLimit: 1000,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    applicableCategories: ["Ghee"],
    userRestrictions: {
      firstTimeOnly: true,
      maxUsagePerUser: 1,
    },
  },
  {
    code: "FREESHIP",
    description: "Free shipping on orders above ₹500",
    discountType: "fixed",
    discountValue: 50,
    minimumOrderAmount: 500,
    maximumDiscount: 50,
    usageLimit: 500,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    isActive: true,
    applicableCategories: ["Ghee"],
  },
  {
    code: "BULK20",
    description: "20% off on bulk orders",
    discountType: "percentage",
    discountValue: 20,
    minimumOrderAmount: 1000,
    maximumDiscount: 500,
    usageLimit: 200,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    isActive: true,
    applicableCategories: ["Ghee"],
  },
  {
    code: "FIRST50",
    description: "₹50 off for first-time buyers",
    discountType: "fixed",
    discountValue: 50,
    minimumOrderAmount: 300,
    maximumDiscount: 50,
    usageLimit: 1000,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    isActive: true,
    applicableCategories: ["Ghee"],
    userRestrictions: {
      firstTimeOnly: true,
      maxUsagePerUser: 1,
    },
  },
  {
    code: "LOYALTY15",
    description: "15% off for loyal customers",
    discountType: "percentage",
    discountValue: 15,
    minimumOrderAmount: 400,
    maximumDiscount: 200,
    usageLimit: 300,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
    isActive: true,
    applicableCategories: ["Ghee"],
  },
];

const seedCoupons = async () => {
  try {
    await connectDB();

    await Coupon.deleteMany();
    console.log("Cleared existing coupons");

    const coupons = await Coupon.insertMany(couponData);
    console.log(`Inserted ${coupons.length} coupons`);

    console.log("Coupons seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding coupons:", error);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedCoupons();
}

module.exports = { couponData, seedCoupons };
