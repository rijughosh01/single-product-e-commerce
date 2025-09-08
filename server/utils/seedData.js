const dotenv = require("dotenv");
const Product = require("../models/Product");
const User = require("../models/User");
const connectDB = require("../config/database");

dotenv.config();

const seedProducts = [];

const seedAdminUser = {
  name: "Admin User",
  email: "admin@ghee-ecommerce.com",
  password: "admin123456",
  phone: "9876543210",
  role: "admin",
};

const seedDatabase = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    console.log("Cleared existing products");

    // Generate SKUs for products
    const productsWithSKU = seedProducts.map((product, index) => {
      const sizeCode = product.size.replace(/[^0-9]/g, "");
      const typeCode = product.type.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      const sku = `GHEE-${typeCode}-${sizeCode}-${timestamp}-${index}`;

      return {
        ...product,
        sku,
      };
    });

    // Insert products only if any are provided
    if (productsWithSKU.length > 0) {
      const products = await Product.insertMany(productsWithSKU);
      console.log(`Inserted ${products.length} products`);
    } else {
      console.log("No seed products provided. Skipping insertion.");
    }

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: seedAdminUser.email });
    if (!existingAdmin) {
      const admin = await User.create(seedAdminUser);
      console.log("Created admin user:", admin.email);
    } else {
      console.log("Admin user already exists");
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedProducts, seedAdminUser };
