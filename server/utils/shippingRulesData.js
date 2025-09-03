const dotenv = require("dotenv");
const ShippingRule = require("../models/ShippingRule");
const connectDB = require("../config/database");

dotenv.config();

const shippingRulesData = [
  // Mumbai Metropolitan Region (400000-400099)
  {
    name: "Mumbai Local Delivery",
    description: "Same day delivery for Mumbai Metropolitan Region",
    pincodeType: "range",
    pincodeRanges: [{ start: "400000", end: "400099" }],
    shippingCharges: 0,
    freeShippingThreshold: 0,
    estimatedDeliveryDays: { min: 1, max: 1 },
    priority: 1,
    isActive: true,
  },

  // Delhi NCR (110000-110099)
  {
    name: "Delhi NCR Express",
    description: "Next day delivery for Delhi NCR region",
    pincodeType: "range",
    pincodeRanges: [{ start: "110000", end: "110099" }],
    shippingCharges: 30,
    freeShippingThreshold: 300,
    estimatedDeliveryDays: { min: 1, max: 2 },
    priority: 2,
    isActive: true,
  },

  // Bangalore (560000-560099)
  {
    name: "Bangalore Metro",
    description: "Fast delivery for Bangalore metropolitan area",
    pincodeType: "range",
    pincodeRanges: [{ start: "560000", end: "560099" }],
    shippingCharges: 40,
    freeShippingThreshold: 400,
    estimatedDeliveryDays: { min: 2, max: 3 },
    priority: 3,
    isActive: true,
  },

  // Chennai (600000-600099)
  {
    name: "Chennai Express",
    description: "Quick delivery for Chennai region",
    pincodeType: "range",
    pincodeRanges: [{ start: "600000", end: "600099" }],
    shippingCharges: 50,
    freeShippingThreshold: 500,
    estimatedDeliveryDays: { min: 2, max: 4 },
    priority: 4,
    isActive: true,
  },

  // Kolkata (700000-700099)
  {
    name: "Kolkata Metro",
    description: "Standard delivery for Kolkata metropolitan area",
    pincodeType: "range",
    pincodeRanges: [{ start: "700000", end: "700099" }],
    shippingCharges: 45,
    freeShippingThreshold: 450,
    estimatedDeliveryDays: { min: 2, max: 4 },
    priority: 5,
    isActive: true,
  },

  // Hyderabad (500000-500099)
  {
    name: "Hyderabad Express",
    description: "Fast delivery for Hyderabad region",
    pincodeType: "range",
    pincodeRanges: [{ start: "500000", end: "500099" }],
    shippingCharges: 55,
    freeShippingThreshold: 550,
    estimatedDeliveryDays: { min: 3, max: 4 },
    priority: 6,
    isActive: true,
  },

  // Pune (411000-411099)
  {
    name: "Pune Local",
    description: "Local delivery for Pune city",
    pincodeType: "range",
    pincodeRanges: [{ start: "411000", end: "411099" }],
    shippingCharges: 35,
    freeShippingThreshold: 350,
    estimatedDeliveryDays: { min: 2, max: 3 },
    priority: 7,
    isActive: true,
  },

  // Ahmedabad (380000-380099)
  {
    name: "Ahmedabad Metro",
    description: "Standard delivery for Ahmedabad region",
    pincodeType: "range",
    pincodeRanges: [{ start: "380000", end: "380099" }],
    shippingCharges: 60,
    freeShippingThreshold: 600,
    estimatedDeliveryDays: { min: 3, max: 5 },
    priority: 8,
    isActive: true,
  },

  // North India Zone
  {
    name: "North India Standard",
    description: "Standard delivery for North Indian states",
    pincodeType: "zone",
    zones: ["North"],
    shippingCharges: 80,
    freeShippingThreshold: 800,
    estimatedDeliveryDays: { min: 4, max: 7 },
    priority: 9,
    isActive: true,
  },

  // South India Zone
  {
    name: "South India Standard",
    description: "Standard delivery for South Indian states",
    pincodeType: "zone",
    zones: ["South"],
    shippingCharges: 90,
    freeShippingThreshold: 900,
    estimatedDeliveryDays: { min: 5, max: 8 },
    priority: 10,
    isActive: true,
  },

  // East India Zone
  {
    name: "East India Standard",
    description: "Standard delivery for East Indian states",
    pincodeType: "zone",
    zones: ["East"],
    shippingCharges: 85,
    freeShippingThreshold: 850,
    estimatedDeliveryDays: { min: 4, max: 7 },
    priority: 11,
    isActive: true,
  },

  // West India Zone
  {
    name: "West India Standard",
    description: "Standard delivery for West Indian states",
    pincodeType: "zone",
    zones: ["West"],
    shippingCharges: 75,
    freeShippingThreshold: 750,
    estimatedDeliveryDays: { min: 3, max: 6 },
    priority: 12,
    isActive: true,
  },

  // North-East Zone
  {
    name: "North-East Express",
    description: "Express delivery for North-East states",
    pincodeType: "zone",
    zones: ["North-East"],
    shippingCharges: 120,
    freeShippingThreshold: 1200,
    estimatedDeliveryDays: { min: 6, max: 10 },
    priority: 13,
    isActive: true,
  },

  // Central India Zone
  {
    name: "Central India Standard",
    description: "Standard delivery for Central Indian states",
    pincodeType: "zone",
    zones: ["Central"],
    shippingCharges: 70,
    freeShippingThreshold: 700,
    estimatedDeliveryDays: { min: 4, max: 7 },
    priority: 14,
    isActive: true,
  },

  // Default rule for all India
  {
    name: "All India Standard",
    description: "Standard delivery for all India",
    pincodeType: "all",
    shippingCharges: 100,
    freeShippingThreshold: 1000,
    estimatedDeliveryDays: { min: 5, max: 10 },
    priority: 15,
    isActive: true,
  },
];

const seedShippingRules = async () => {
  try {
    await connectDB();

    await ShippingRule.deleteMany();
    console.log("Cleared existing shipping rules");

    const shippingRules = await ShippingRule.insertMany(shippingRulesData);
    console.log(`Inserted ${shippingRules.length} shipping rules`);

    console.log("Shipping rules seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding shipping rules:", error);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedShippingRules();
}

module.exports = { shippingRulesData, seedShippingRules };
