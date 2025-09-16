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

    // Get orders by date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).select("totalPrice orderStatus createdAt");

    // Get revenue data for chart
    const revenueChart = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $in: ["Delivered", "Shipped"] },
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
    ]);

    // Get order status distribution
    const orderStatusChart = await Order.aggregate([
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
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
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
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
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
    ]);

    // Get user growth data
    const userGrowthChart = await User.aggregate([
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
    ]);

    // Format chart data
    const formatChartData = (data, key = "_id", value = "count") => {
      return {
        labels: data.map((item) => item[key]),
        values: data.map((item) => item[value]),
      };
    };

    res.status(200).json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalRevenue: orders
          .filter((order) =>
            ["Delivered", "Shipped"].includes(order.orderStatus)
          )
          .reduce((sum, order) => sum + order.totalPrice, 0),
        topProducts,
        // Chart data
        revenueChart: formatChartData(revenueChart, "_id", "revenue"),
        orderStatusChart: formatChartData(orderStatusChart, "_id", "count"),
        topProductsChart: formatChartData(topProducts, "name", "totalQuantity"),
        userGrowthChart: formatChartData(userGrowthChart, "_id", "count"),
      },
    });
  } catch (error) {
    next(error);
  }
};
