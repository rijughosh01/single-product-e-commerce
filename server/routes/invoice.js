const express = require("express");
const {
  generateInvoice,
  getInvoice,
  getMyInvoices,
  downloadInvoicePDF,
  getAllInvoices,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// User routes
router
  .route("/invoice/generate/:orderId")
  .post(isAuthenticatedUser, generateInvoice);
router.route("/invoice/:id").get(isAuthenticatedUser, getInvoice);
router.route("/invoices/me").get(isAuthenticatedUser, getMyInvoices);
router.route("/invoice/:id/pdf").get(isAuthenticatedUser, downloadInvoicePDF);

// Admin routes
router
  .route("/admin/invoices")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllInvoices);
router
  .route("/admin/invoice/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateInvoice)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteInvoice);

module.exports = router;
