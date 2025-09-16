const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const ErrorHandler = require("../utils/errorHandler");

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue
    const orders = await Order.find({
      orderStatus: { $in: ["Delivered", "Shipped"] },
    });
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id totalPrice orderStatus createdAt user");

    console.log("Recent Orders Query Result:", recentOrders);

    // Get monthly stats
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    });

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          orderStatus: { $in: ["Delivered", "Shipped"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const monthlyRevenueAmount =
      monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select("name stock")
      .limit(5);

    const responseData = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyOrders,
      monthlyRevenue: monthlyRevenueAmount,
      recentOrders: recentOrders.map((order) => ({
        id: order._id,
        customer: order.user?.name || "Unknown User",
        amount: order.totalPrice,
        status: order.orderStatus,
        date: order.createdAt,
      })),
      lowStockProducts,
    };

    console.log("Dashboard Response Data:", responseData);
    console.log("Recent Orders in Response:", responseData.recentOrders);

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

// Get analytics data => /api/v1/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { range = "month" } = req.query;

    let startDate, endDate;
    const currentDate = new Date();

    switch (range) {
      case "week":
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = currentDate;
        break;
      case "month":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = currentDate;
        break;
      case "quarter":
        const quarterStart = Math.floor(currentDate.getMonth() / 3) * 3;
        startDate = new Date(currentDate.getFullYear(), quarterStart, 1);
        endDate = currentDate;
        break;
      case "year":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = currentDate;
        break;
      default:
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = currentDate;
    }

    // Get comprehensive analytics data
    const [
      orders,
      totalUsers,
      totalProducts,
      activeProducts,
      featuredProducts,
      outOfStockProducts,
      revenueChart,
      orderStatusChart,
      topProducts,
      userGrowthChart,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).select("totalPrice orderStatus createdAt orderItems user"),

      // Get total users count
      User.countDocuments({ role: "user" }),

      // Get total products count
      Product.countDocuments(),

      // Get active products count
      Product.countDocuments({ isActive: true }),

      // Get featured products count
      Product.countDocuments({ featured: true }),

      // Get out of stock products count
      Product.countDocuments({ stock: { $lte: 0 } }),

      // Get revenue data for chart
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: { $in: ["Delivered", "Shipped", "Out for Delivery"] },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      // Get order status distribution
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      // Get top selling products
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $unwind: "$orderItems",
        },
        {
          $group: {
            _id: "$orderItems.product",
            totalQuantity: { $sum: "$orderItems.quantity" },
            totalRevenue: {
              $sum: {
                $multiply: ["$orderItems.price", "$orderItems.quantity"],
              },
            },
          },
        },
        {
          $sort: { totalQuantity: -1 },
        },
        {
          $limit: 5,
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            name: "$product.name",
            totalQuantity: 1,
            totalRevenue: 1,
          },
        },
      ]),

      // Get user growth data
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            role: "user",
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      // Get recent orders for activity feed
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id totalPrice orderStatus createdAt user"),

      Product.find({ stock: { $lt: 10, $gt: 0 } })
        .select("name stock")
        .limit(5),
    ]);

    // Calculate growth percentages
    const previousStartDate = new Date(
      startDate.getTime() - (endDate.getTime() - startDate.getTime())
    );
    const previousEndDate = new Date(startDate.getTime() - 1);

    const [previousOrders, previousUsers] = await Promise.all([
      Order.find({
        createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      }),
      User.find({
        createdAt: { $gte: previousStartDate, $lte: previousEndDate },
        role: "user",
      }),
    ]);

    const previousRevenue = previousOrders
      .filter((order) =>
        ["Delivered", "Shipped", "Out for Delivery"].includes(order.orderStatus)
      )
      .reduce((sum, order) => sum + order.totalPrice, 0);

    const currentRevenue = orders
      .filter((order) =>
        ["Delivered", "Shipped", "Out for Delivery"].includes(order.orderStatus)
      )
      .reduce((sum, order) => sum + order.totalPrice, 0);

    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;
    const ordersGrowth =
      previousOrders.length > 0
        ? ((orders.length - previousOrders.length) / previousOrders.length) *
          100
        : 0;
    const usersGrowth =
      previousUsers.length > 0
        ? ((userGrowthChart.reduce((sum, item) => sum + item.count, 0) -
            previousUsers.length) /
            previousUsers.length) *
          100
        : 0;

    // Format chart data
    const formatChartData = (data, key = "_id", value = "count") => {
      return {
        labels: data.map((item) => item[key]),
        values: data.map((item) => item[value]),
      };
    };

    // Format recent activity
    const recentActivity = recentOrders.map((order) => ({
      type: "order",
      message: `Order #${order._id.toString().slice(-4)} placed by ${
        order.user?.name || "Unknown User"
      }`,
      time: getTimeAgo(order.createdAt),
    }));

    // Add product activities
    const productActivities = lowStockProducts.slice(0, 2).map((product) => ({
      type: "product",
      message: `Product "${product.name}" is running low on stock (${product.stock} left)`,
      time: "Recently",
    }));

    const allRecentActivity = [...recentActivity, ...productActivities].slice(
      0,
      5
    );

    res.status(200).json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalRevenue: currentRevenue,
        totalUsers,
        totalProducts,
        activeProducts,
        featuredProducts,
        outOfStockProducts,

        // Growth metrics
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        ordersGrowth: Math.round(ordersGrowth * 100) / 100,
        usersGrowth: Math.round(usersGrowth * 100) / 100,

        topProducts,

        recentActivity: allRecentActivity,

        // Chart data
        revenueChart: formatChartData(revenueChart, "_id", "revenue"),
        orderStatusChart: formatChartData(orderStatusChart, "_id", "count"),
        topProductsChart: formatChartData(topProducts, "name", "totalQuantity"),
        userGrowthChart: formatChartData(userGrowthChart, "_id", "count"),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    next(error);
  }
};

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}
