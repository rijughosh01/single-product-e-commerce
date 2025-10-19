const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");
const { Parser } = require("json2csv");

// route   GET /api/v1/analytics/dashboard
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { period = "30d", type = "daily" } = req.query;

    let days;
    switch (period) {
      case "7d":
        days = 7;
        break;
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      case "1y":
        days = 365;
        break;
      default:
        days = 30;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const [orders, users, products] = await Promise.all([
      Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).populate("orderItems.product", "name type size"),
      User.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      Product.find({}),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );
    const totalOrders = orders.length;
    const totalCustomers = users.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Find top selling product
    const productSales = {};
    orders.forEach((order) => {
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item) => {
          if (item.product) {
            const productName = item.product.name || "Unknown Product";
            if (!productSales[productName]) {
              productSales[productName] = {
                name: productName,
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[productName].quantity += item.quantity || 0;
            productSales[productName].revenue +=
              (item.price || 0) * (item.quantity || 0);
          }
        });
      }
    });

    const topSellingProduct =
      Object.values(productSales).sort((a, b) => b.quantity - a.quantity)[0] ||
      {};

    // Calculate growth metrics
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const [previousOrders, previousUsers] = await Promise.all([
      Order.find({
        createdAt: { $gte: previousStartDate, $lt: startDate },
      }),
      User.find({
        createdAt: { $gte: previousStartDate, $lt: startDate },
      }),
    ]);

    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );
    const previousOrderCount = previousOrders.length;
    const previousCustomerCount = previousUsers.length;

    const revenueGrowth =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    const orderGrowth =
      previousOrderCount > 0
        ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
        : 0;

    const customerGrowth =
      previousCustomerCount > 0
        ? ((totalCustomers - previousCustomerCount) / previousCustomerCount) *
          100
        : 0;

    // Create daily analytics data for charts
    const analyticsData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = orders.filter(
        (order) => order.createdAt >= date && order.createdAt <= dayEnd
      );

      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );
      const dayCustomers = users.filter(
        (user) => user.createdAt >= date && user.createdAt <= dayEnd
      ).length;

      analyticsData.push({
        date: date.getTime(),
        revenue: dayRevenue,
        orders: dayOrders.length,
        customers: dayCustomers,
      });
    }

    const summary = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      topSellingProduct,
      revenueGrowth,
      orderGrowth,
      customerGrowth,
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        analytics: analyticsData.reverse(),
        period,
        type,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// route   GET /api/v1/analytics/financial-reports
const getFinancialReports = async (req, res, next) => {
  try {
    const { startDate, endDate, reportType = "comprehensive" } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("user", "name email")
      .populate("orderItems.product", "name type size");

    // Revenue Analysis
    const revenueAnalysis = {
      grossRevenue: orders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      ),
      netRevenue: orders
        .filter((order) => order.orderStatus === "Delivered")
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      refundedAmount: orders
        .filter((order) => order.orderStatus === "Returned")
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      cancelledAmount: orders
        .filter((order) => order.orderStatus === "Cancelled")
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      taxCollected: orders.reduce(
        (sum, order) => sum + (order.taxPrice || 0),
        0
      ),
      shippingCollected: orders.reduce(
        (sum, order) => sum + (order.shippingPrice || 0),
        0
      ),
    };

    // Payment Method Analysis
    const paymentAnalysis = {
      razorpay: {
        count: orders.filter(
          (order) => order.paymentInfo?.method === "razorpay"
        ).length,
        amount: orders
          .filter((order) => order.paymentInfo?.method === "razorpay")
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      },
      cod: {
        count: orders.filter((order) => order.paymentInfo?.method === "cod")
          .length,
        amount: orders
          .filter((order) => order.paymentInfo?.method === "cod")
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      },
    };

    // Product Performance Analysis
    const productPerformance = {};
    orders.forEach((order) => {
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item) => {
          if (item.product) {
            const productName = item.product.name;
            if (!productPerformance[productName]) {
              productPerformance[productName] = {
                name: productName,
                type: item.product.type,
                size: item.product.size,
                quantitySold: 0,
                revenue: 0,
                orders: 0,
              };
            }
            productPerformance[productName].quantitySold += item.quantity || 0;
            productPerformance[productName].revenue +=
              (item.price || 0) * (item.quantity || 0);
            productPerformance[productName].orders += 1;
          }
        });
      }
    });

    const topProducts = Object.values(productPerformance)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Customer Analysis
    const customerAnalysis = {
      totalCustomers: new Set(
        orders.map((order) => order.user?._id?.toString()).filter(Boolean)
      ).size,
      newCustomers: await User.countDocuments({
        createdAt: { $gte: start, $lte: end },
      }),
      repeatCustomers: 0,
      averageOrderValue: 0,
    };

    if (orders.length > 0) {
      customerAnalysis.averageOrderValue =
        revenueAnalysis.grossRevenue / orders.length;

      // Calculate repeat customers
      const customerOrderCounts = {};
      orders.forEach((order) => {
        if (order.user) {
          const userId = order.user._id.toString();
          customerOrderCounts[userId] = (customerOrderCounts[userId] || 0) + 1;
        }
      });
      customerAnalysis.repeatCustomers = Object.values(
        customerOrderCounts
      ).filter((count) => count > 1).length;
    }

    // Geographic Analysis - Track orders, customers, and revenue per state
    const stateData = {};
    orders.forEach((order) => {
      if (order.shippingInfo?.state) {
        const state = order.shippingInfo.state;
        if (!stateData[state]) {
          stateData[state] = {
            state,
            revenue: 0,
            orders: 0,
            customers: new Set(),
          };
        }

        stateData[state].revenue += order.totalPrice || 0;
        stateData[state].orders += 1;

        if (order.user && order.user._id) {
          stateData[state].customers.add(order.user._id.toString());
        }
      }
    });

    const topStates = Object.values(stateData)
      .map((state) => ({
        state: state.state,
        revenue: state.revenue,
        orders: state.orders,
        customers: state.customers.size,
        averageOrderValue: state.orders > 0 ? state.revenue / state.orders : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Time Analysis
    const hourlyDistribution = {};
    const dailyDistribution = {};
    const monthlyDistribution = {};

    for (let hour = 0; hour < 24; hour++) {
      hourlyDistribution[hour] = { orders: 0, revenue: 0 };
    }

    // 0-6, Sunday-Saturday
    for (let day = 0; day < 7; day++) {
      dailyDistribution[day] = { orders: 0, revenue: 0 };
    }

    // 0-11, January-December
    for (let month = 0; month < 12; month++) {
      monthlyDistribution[month] = { orders: 0, revenue: 0 };
    }

    // Process orders and populate distributions
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const hour = orderDate.getHours();
      const day = orderDate.getDay();
      const month = orderDate.getMonth();
      const revenue = order.totalPrice || 0;

      if (hourlyDistribution[hour]) {
        hourlyDistribution[hour].orders += 1;
        hourlyDistribution[hour].revenue += revenue;
      }

      if (dailyDistribution[day]) {
        dailyDistribution[day].orders += 1;
        dailyDistribution[day].revenue += revenue;
      }

      if (monthlyDistribution[month]) {
        monthlyDistribution[month].orders += 1;
        monthlyDistribution[month].revenue += revenue;
      }
    });

    const timeAnalysis = {
      hourlyDistribution,
      dailyDistribution,
      monthlyDistribution,
    };

    // Coupon Analysis
    const couponAnalysis = {
      totalCouponsUsed: orders.filter((order) => order.coupon).length,
      totalDiscountGiven: orders.reduce(
        (sum, order) => sum + (order.coupon?.discountApplied || 0),
        0
      ),
      averageDiscountPerOrder: 0,
      couponEffectiveness: 0,
    };

    if (couponAnalysis.totalCouponsUsed > 0) {
      couponAnalysis.averageDiscountPerOrder =
        couponAnalysis.totalDiscountGiven / couponAnalysis.totalCouponsUsed;
      couponAnalysis.couponEffectiveness =
        (couponAnalysis.totalCouponsUsed / orders.length) * 100;
    }

    res.status(200).json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        revenueAnalysis,
        paymentAnalysis,
        productPerformance: topProducts,
        customerAnalysis,
        geographicAnalysis: topStates,
        timeAnalysis,
        couponAnalysis,
        summary: {
          totalOrders: orders.length,
          totalRevenue: revenueAnalysis.grossRevenue,
          averageOrderValue: customerAnalysis.averageOrderValue,
          totalCustomers: customerAnalysis.totalCustomers,
          conversionRate: 0,
        },
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// route   GET /api/v1/analytics/revenue-trends
const getRevenueTrends = async (req, res, next) => {
  try {
    const { period = "30d", granularity = "daily" } = req.query;

    let days;
    switch (period) {
      case "7d":
        days = 7;
        break;
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      case "1y":
        days = 365;
        break;
      default:
        days = 30;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const [orders, users] = await Promise.all([
      Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      User.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
    ]);

    const trends = [];

    if (granularity === "daily") {
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayOrders = orders.filter(
          (order) => order.createdAt >= date && order.createdAt <= dayEnd
        );

        const dayRevenue = dayOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );
        const dayCustomers = users.filter(
          (user) => user.createdAt >= date && user.createdAt <= dayEnd
        ).length;

        trends.push({
          date: date.getTime(),
          revenue: dayRevenue,
          orders: dayOrders.length,
          customers: dayCustomers,
        });
      }
    } else if (granularity === "weekly") {
      const weeks = Math.ceil(days / 7);
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        weekEnd.setHours(23, 59, 59, 999);

        const weekOrders = orders.filter(
          (order) => order.createdAt >= weekStart && order.createdAt <= weekEnd
        );

        const weekRevenue = weekOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );
        const weekCustomers = users.filter(
          (user) => user.createdAt >= weekStart && user.createdAt <= weekEnd
        ).length;

        trends.push({
          date: `Week ${weeks - i}`,
          revenue: weekRevenue,
          orders: weekOrders.length,
          customers: weekCustomers,
        });
      }
    }

    // Calculate growth rates
    const growthRates = {
      revenue: 0,
      orders: 0,
      customers: 0,
    };

    if (trends.length >= 2) {
      const current = trends[trends.length - 1];
      const previous = trends[trends.length - 2];

      growthRates.revenue =
        previous.revenue > 0
          ? ((current.revenue - previous.revenue) / previous.revenue) * 100
          : 0;

      growthRates.orders =
        previous.orders > 0
          ? ((current.orders - previous.orders) / previous.orders) * 100
          : 0;

      growthRates.customers =
        previous.customers > 0
          ? ((current.customers - previous.customers) / previous.customers) *
            100
          : 0;
    }

    res.status(200).json({
      success: true,
      data: {
        trends: trends.reverse(),
        growthRates,
        period,
        granularity,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// route   GET /api/v1/analytics/product-performance
const getProductPerformance = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      orderStatus: { $in: ["Delivered", "Shipped", "Out for Delivery"] },
    }).populate("orderItems.product", "name type size price");

    const productPerformance = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.product._id.toString();
        if (!productPerformance[productId]) {
          productPerformance[productId] = {
            productId,
            name: item.product.name,
            type: item.product.type,
            size: item.product.size,
            price: item.product.price,
            quantity: 0,
            revenue: 0,
            orders: 0,
            averageOrderValue: 0,
          };
        }
        productPerformance[productId].quantity += item.quantity;
        productPerformance[productId].revenue += item.price * item.quantity;
        productPerformance[productId].orders += 1;
      });
    });

    // Calculate average order value for each product
    Object.values(productPerformance).forEach((product) => {
      product.averageOrderValue =
        product.orders > 0 ? product.revenue / product.orders : 0;
    });

    const sortedProducts = Object.values(productPerformance)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        products: sortedProducts,
        totalProducts: Object.keys(productPerformance).length,
        period: { startDate: start, endDate: end },
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

module.exports = {
  getDashboardAnalytics,
  getFinancialReports,
  getRevenueTrends,
  getProductPerformance,
};

// route   GET /api/v1/analytics/export
const exportAnalytics = async (req, res, next) => {
  try {
    const { type = "overview", period = "30d" } = req.query;

    let data = [];

    if (type === "overview") {
      let days;
      switch (period) {
        case "7d":
          days = 7;
          break;
        case "30d":
          days = 30;
          break;
        case "90d":
          days = 90;
          break;
        case "1y":
          days = 365;
          break;
        default:
          days = 30;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const [orders, users] = await Promise.all([
        Order.find({
          createdAt: { $gte: startDate, $lte: endDate },
        }).select("createdAt totalPrice"),
        User.find({
          createdAt: { $gte: startDate, $lte: endDate },
        }).select("createdAt"),
      ]);

      const analyticsRows = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayOrders = orders.filter(
          (order) => order.createdAt >= date && order.createdAt <= dayEnd
        );
        const dayRevenue = dayOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );
        const dayCustomers = users.filter(
          (user) => user.createdAt >= date && user.createdAt <= dayEnd
        ).length;

        analyticsRows.push({
          date: date.toISOString().slice(0, 10),
          revenue: dayRevenue,
          orders: dayOrders.length,
          customers: dayCustomers,
        });
      }

      data = analyticsRows.reverse();
    } else if (type === "financial") {
      const orders = await Order.find({}).select(
        "createdAt totalPrice taxPrice shippingPrice orderStatus paymentInfo.method"
      );
      data = orders.map((o) => ({
        date: new Date(o.createdAt).toISOString(),
        totalPrice: o.totalPrice || 0,
        tax: o.taxPrice || 0,
        shipping: o.shippingPrice || 0,
        orderStatus: o.orderStatus,
        paymentMethod: o.paymentInfo?.method || "unknown",
      }));
    } else if (type === "products") {
      const products = await Product.find({}).select(
        "name type size price createdAt"
      );
      data = products.map((p) => ({
        name: p.name,
        type: p.type,
        size: p.size,
        price: p.price,
        createdAt: new Date(p.createdAt).toISOString(),
      }));
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=analytics-${type}-${Date.now()}.csv`
    );
    return res.status(200).send(csv);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

module.exports.exportAnalytics = exportAnalytics;
