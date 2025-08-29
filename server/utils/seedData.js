const dotenv = require("dotenv");
const Product = require("../models/Product");
const User = require("../models/User");
const connectDB = require("../config/database");

// Load environment variables
dotenv.config();

const seedProducts = [
  {
    name: "Pure Cow Ghee - 250g",
    description:
      "Authentic pure cow ghee made from A2 milk, rich in nutrients and traditional taste. Perfect for cooking, frying, and traditional recipes.",
    price: 180,
    originalPrice: 200,
    discount: 10,
    size: "250g",
    type: "Pure Cow Ghee",
    category: "Ghee",
    stock: 100,
    weight: 250,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 900,
      protein: 0,
      fat: 100,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-cow-250g-1",
        url: "https://images.unsplash.com/photo-1707424124274-689499bbe5e9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    isActive: true,
    featured: true,
  },
  {
    name: "Pure Cow Ghee - 500g",
    description:
      "Pure cow ghee in convenient 500g pack. Rich in vitamins A, D, E, and K. Ideal for daily cooking and traditional Indian cuisine.",
    price: 350,
    originalPrice: 380,
    discount: 8,
    size: "500g",
    type: "Pure Cow Ghee",
    category: "Ghee",
    stock: 75,
    weight: 500,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 900,
      protein: 0,
      fat: 100,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-cow-500g-1",
        url: "https://images.unsplash.com/photo-1707424963059-6a7a559cae28?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    isActive: true,
    featured: true,
  },
  {
    name: "Pure Cow Ghee - 1kg",
    description:
      "Premium quality cow ghee in 1kg pack. Perfect for families and bulk cooking. Rich in essential fatty acids and antioxidants.",
    price: 680,
    originalPrice: 750,
    discount: 9,
    size: "1kg",
    type: "Pure Cow Ghee",
    category: "Ghee",
    stock: 50,
    weight: 1000,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 900,
      protein: 0,
      fat: 100,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-cow-1kg-1",
        url: "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    isActive: true,
    featured: false,
  },
  {
    name: "Buffalo Ghee - 500g",
    description:
      "Rich and creamy buffalo ghee with higher fat content. Perfect for making rich gravies and traditional sweets.",
    price: 320,
    originalPrice: 350,
    discount: 9,
    size: "500g",
    type: "Buffalo Ghee",
    category: "Ghee",
    stock: 60,
    weight: 500,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 950,
      protein: 0,
      fat: 105,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-buffalo-500g-1",
        url: "https://images.unsplash.com/photo-1707425197195-240b7ad69047?q=80&w=489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    isActive: true,
    featured: false,
  },
  {
    name: "Buffalo Ghee - 1kg",
    description:
      "Premium buffalo ghee in 1kg pack. Rich in flavor and perfect for traditional Indian cooking and sweets.",
    price: 620,
    originalPrice: 680,
    discount: 9,
    size: "1kg",
    type: "Buffalo Ghee",
    category: "Ghee",
    stock: 40,
    weight: 1000,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 950,
      protein: 0,
      fat: 105,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-buffalo-1kg-1",
        url: "https://images.unsplash.com/photo-1707425197254-266fec098cae?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    isActive: true,
    featured: false,
  },
  {
    name: "Organic Ghee - 500g",
    description:
      "Certified organic ghee made from grass-fed cow milk. Free from pesticides and chemicals. Perfect for health-conscious consumers.",
    price: 450,
    originalPrice: 500,
    discount: 10,
    size: "500g",
    type: "Organic Ghee",
    category: "Ghee",
    stock: 30,
    weight: 500,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 900,
      protein: 0,
      fat: 100,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-organic-500g-1",
        url: "https://as2.ftcdn.net/v2/jpg/15/57/21/35/1000_F_1557213587_aIHf2bxJ6Jvm7cpIXQAZePy1Mx19rb3a.jpg",
      },
    ],
    isActive: true,
    featured: true,
  },
  {
    name: "A2 Ghee - 250g",
    description:
      "Premium A2 ghee made from A2 cow milk. Easier to digest and rich in nutrients. Perfect for those with milk sensitivity.",
    price: 220,
    originalPrice: 250,
    discount: 12,
    size: "250g",
    type: "A2 Ghee",
    category: "Ghee",
    stock: 45,
    weight: 250,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 900,
      protein: 0,
      fat: 100,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-a2-250g-1",
        url: "https://as2.ftcdn.net/v2/jpg/14/87/29/61/1000_F_1487296105_HF8kaipijTODI0OxZpUZ9cNO1FRcCRwH.jpg",
      },
    ],
    isActive: true,
    featured: true,
  },
  {
    name: "A2 Ghee - 500g",
    description:
      "A2 ghee in 500g pack. Made from pure A2 cow milk, rich in omega-3 and conjugated linoleic acid (CLA).",
    price: 420,
    originalPrice: 480,
    discount: 13,
    size: "500g",
    type: "A2 Ghee",
    category: "Ghee",
    stock: 35,
    weight: 500,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 900,
      protein: 0,
      fat: 100,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-a2-500g-1",
        url: "https://as1.ftcdn.net/v2/jpg/08/36/29/96/1000_F_836299683_A5daipMkHhg8Y7Botq85YVy5h9wLdeGj.jpg",
      },
    ],
    isActive: true,
    featured: false,
  },
  {
    name: "Mixed Ghee - 1kg",
    description:
      "Blend of cow and buffalo ghee for balanced taste and nutrition. Perfect for all types of cooking and traditional recipes.",
    price: 580,
    originalPrice: 650,
    discount: 11,
    size: "1kg",
    type: "Mixed Ghee",
    category: "Ghee",
    stock: 25,
    weight: 1000,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 925,
      protein: 0,
      fat: 102,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-mixed-1kg-1",
        url: "https://as2.ftcdn.net/v2/jpg/13/78/90/03/1000_F_1378900337_t635H3063QWFGWcTRdu74QtcTD8dculx.jpg",
      },
    ],
    isActive: true,
    featured: false,
  },
  {
    name: "Pure Cow Ghee - 2kg",
    description:
      "Large family pack of pure cow ghee. Economical for families and bulk cooking. Rich in traditional taste and nutrition.",
    price: 1300,
    originalPrice: 1500,
    discount: 13,
    size: "2kg",
    type: "Pure Cow Ghee",
    category: "Ghee",
    stock: 20,
    weight: 2000,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    manufacturingDate: new Date(),
    nutritionalInfo: {
      calories: 900,
      protein: 0,
      fat: 100,
      carbohydrates: 0,
      fiber: 0,
    },
    images: [
      {
        public_id: "ghee-cow-2kg-1",
        url: "https://as2.ftcdn.net/v2/jpg/05/97/44/35/1000_F_597443539_y00NOnVJqACJjXfFk4EbPUiRl2LAxBT1.jpg",
      },
    ],
    isActive: true,
    featured: false,
  },
];

const seedAdminUser = {
  name: "Admin User",
  email: "admin@ghee-ecommerce.com",
  password: "admin123456",
  phone: "9876543210",
  role: "admin",
};

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
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

    // Insert products
    const products = await Product.insertMany(productsWithSKU);
    console.log(`Inserted ${products.length} products`);

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
