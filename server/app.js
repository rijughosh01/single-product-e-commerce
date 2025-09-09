const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const WebSocketServer = require("./utils/websocket");

dotenv.config();

const connectDB = require("./config/database");

// Route files
const auth = require("./routes/auth");
const products = require("./routes/products");
const orders = require("./routes/orders");
const cart = require("./routes/cart");
const users = require("./routes/users");
const shipping = require("./routes/shipping");
const invoice = require("./routes/invoice");
const coupons = require("./routes/coupons");
const wishlist = require("./routes/wishlist");
const notifications = require("./routes/notifications");
const subscriptions = require("./routes/subscriptions");
const admin = require("./routes/admin");

connectDB();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.options("*", cors());

// Rate limiting
if (process.env.NODE_ENV !== "development") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api/", limiter);
}

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Mount routers
app.use("/api/v1", auth);
app.use("/api/v1", products);
app.use("/api/v1", orders);
app.use("/api/v1", cart);
app.use("/api/v1", users);
app.use("/api/v1", shipping);
app.use("/api/v1", invoice);
app.use("/api/v1", coupons);
app.use("/api/v1", wishlist);
app.use("/api/v1", notifications);
app.use("/api/v1", subscriptions);
app.use("/api/v1", admin);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// WebSocket test route
app.get("/api/websocket-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "WebSocket server is available",
    websocketUrl: `ws://${req.get("host")}`,
    timestamp: new Date().toISOString(),
  });
});

// Handle unhandled routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize WebSocket server
const wss = new WebSocketServer(server);

global.wss = wss;

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});

module.exports = app;
