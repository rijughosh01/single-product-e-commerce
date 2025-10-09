const express = require("express");
const {
  createReturnRequest,
  getMyReturns,
  getReturnRequest,
  updateReturnStatus,
  processReturnRefund,
  processCODRefund,
  getAllReturns,
  cancelReturnRequest,
  getReturnStats,
} = require("../controllers/returnController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Customer routes
router.post("/request", isAuthenticatedUser, createReturnRequest);
router.get("/my-returns", isAuthenticatedUser, getMyReturns);
router.get("/:id", isAuthenticatedUser, getReturnRequest);
router.put("/:id/cancel", isAuthenticatedUser, cancelReturnRequest);

// Admin routes
router.get(
  "/admin/returns",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllReturns
);
router.put(
  "/admin/:id/status",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateReturnStatus
);
router.post(
  "/admin/:id/refund",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  processReturnRefund
);
router.post(
  "/admin/:id/cod-refund",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  processCODRefund
);
router.get(
  "/admin/returns/stats",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getReturnStats
);

module.exports = router;
