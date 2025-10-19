const express = require("express");
const router = express.Router();
const {
  getDashboardAnalytics,
  getFinancialReports,
  getRevenueTrends,
  getProductPerformance,
  exportAnalytics,
} = require("../controllers/analyticsController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.use(isAuthenticatedUser);
router.use(authorizeRoles("admin"));

router.get("/dashboard", getDashboardAnalytics);

router.get("/financial-reports", getFinancialReports);

router.get("/revenue-trends", getRevenueTrends);

router.get("/product-performance", getProductPerformance);

router.get("/export", exportAnalytics);

module.exports = router;
