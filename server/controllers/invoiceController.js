const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Generate invoice for an order => /api/v1/invoice/generate/:orderId
exports.generateInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate("orderItems.product");

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    // Validate order has required fields
    if (!order.orderItems || order.orderItems.length === 0) {
      return next(new ErrorHandler("Order has no items", 400));
    }

    if (!order.shippingInfo) {
      return next(new ErrorHandler("Order has no shipping information", 400));
    }

    if (!order.paymentInfo) {
      return next(new ErrorHandler("Order has no payment information", 400));
    }

    // If COD and not delivered yet, block invoice generation
    if (
      order.paymentInfo?.method === "cod" &&
      order.orderStatus !== "Delivered"
    ) {
      return next(
        new ErrorHandler(
          "Invoice will be available after delivery for Cash on Delivery orders",
          403
        )
      );
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ order: orderId });
    if (existingInvoice) {
      return res.status(200).json({
        success: true,
        message: "Invoice already exists",
        invoice: existingInvoice,
      });
    }

    // Get user's default address for billing
    const user = await User.findById(order.user._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const defaultAddress =
      user.addresses?.find((addr) => addr.isDefault) || user.addresses?.[0];

    if (!defaultAddress) {
      return next(new ErrorHandler("No billing address found for user", 400));
    }

    const invoiceItems = order.orderItems.map((item) => ({
      product: item.product._id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      gstRate: 12,
      cgst: 0,
      sgst: 0,
      igst: 0,
    }));

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber: invoiceNumber,
      order: orderId,
      user: order.user._id,
      invoiceDate: new Date(),
      dueDate: dueDate,
      billingAddress: {
        name: defaultAddress.name,
        address: defaultAddress.address,
        city: defaultAddress.city,
        state: defaultAddress.state,
        pincode: defaultAddress.pincode,
        phone: defaultAddress.phone,
      },
      shippingAddress: {
        name: order.shippingInfo.name,
        address: order.shippingInfo.address,
        city: order.shippingInfo.city,
        state: order.shippingInfo.state,
        pincode: order.shippingInfo.pincode,
        phone: order.shippingInfo.phone,
      },
      items: invoiceItems,
      subtotal: order.itemsPrice,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      shippingCharges: order.shippingPrice,
      discount: Number(order?.coupon?.discountApplied || 0),
      totalAmount: Number(order.totalPrice),
      amountInWords: "",
      paymentStatus:
        order.paymentInfo?.method === "cod" && order.orderStatus !== "Delivered"
          ? "Pending"
          : "Paid",
      paymentMethod: order.paymentInfo.method,
      paymentDate:
        order.paymentInfo?.method === "cod" && order.orderStatus !== "Delivered"
          ? null
          : order.paidAt,
    });

    invoice.calculateGST();
    invoice.amountInWords = invoice.amountToWords(invoice.totalAmount);

    if (!invoice.amountInWords) {
      invoice.amountInWords = invoice.amountToWords(invoice.totalAmount);
    }

    // Validate the invoice before saving
    const validationError = invoice.validateSync();
    if (validationError) {
      console.error("Invoice validation error:", validationError);
      throw new Error(`Invoice validation failed: ${validationError.message}`);
    }

    await invoice.save();

    // Update the order with the invoice ID
    await Order.findByIdAndUpdate(orderId, { invoice: invoice._id });

    res.status(201).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID => /api/v1/invoice/:id
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("order")
      .populate("user", "name email phone")
      .populate("items.product");

    if (!invoice) {
      return next(new ErrorHandler("Invoice not found", 404));
    }

    // Block download for COD orders until delivered
    if (
      invoice.order?.paymentInfo?.method === "cod" &&
      invoice.order?.orderStatus !== "Delivered"
    ) {
      return next(
        new ErrorHandler(
          "Invoice download will be available after delivery for Cash on Delivery orders",
          403
        )
      );
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's invoices => /api/v1/invoices/me
exports.getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// Download invoice PDF => /api/v1/invoice/:id/pdf
exports.downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("order")
      .populate("user", "name email phone")
      .populate("items.product");

    if (!invoice) {
      return next(new ErrorHandler("Invoice not found", 404));
    }

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(20).text(invoice.companyInfo.name, { align: "center" });
    doc.fontSize(10).text(invoice.companyInfo.address, { align: "center" });
    doc
      .fontSize(10)
      .text(
        `GSTIN: ${invoice.companyInfo.gstin} | PAN: ${invoice.companyInfo.pan}`,
        { align: "center" }
      );
    doc
      .fontSize(10)
      .text(
        `Phone: ${invoice.companyInfo.phone} | Email: ${invoice.companyInfo.email}`,
        { align: "center" }
      );

    doc.moveDown();

    // Invoice details
    doc.fontSize(16).text("TAX INVOICE", { align: "center" });
    doc.moveDown();

    // Invoice info table
    const invoiceInfoY = doc.y;
    doc.fontSize(10);
    doc.text("Invoice Number:", 50, invoiceInfoY);
    doc.text(invoice.invoiceNumber, 200, invoiceInfoY);

    doc.text("Invoice Date:", 50, invoiceInfoY + 20);
    doc.text(
      new Date(invoice.invoiceDate).toLocaleDateString("en-IN"),
      200,
      invoiceInfoY + 20
    );

    doc.text("Due Date:", 50, invoiceInfoY + 40);
    doc.text(
      new Date(invoice.dueDate).toLocaleDateString("en-IN"),
      200,
      invoiceInfoY + 40
    );

    doc.text("Payment Status:", 350, invoiceInfoY);
    doc.text(invoice.paymentStatus, 450, invoiceInfoY);

    doc.text("Payment Method:", 350, invoiceInfoY + 20);
    doc.text(invoice.paymentMethod, 450, invoiceInfoY + 20);

    doc.moveDown(3);

    // Billing and shipping addresses
    const addressY = doc.y;
    const leftColX = 50;
    const rightColX = 330;
    const colWidth = 200;
    const lineHeight = 14;

    doc.fontSize(12).text("Bill To:", leftColX, addressY);
    doc.fontSize(10);
    let yPos = addressY + 18;
    doc.text(invoice.billingAddress.name, leftColX, yPos, { width: colWidth });
    yPos += lineHeight;
    doc.text(invoice.billingAddress.address, leftColX, yPos, {
      width: colWidth,
    });
    yPos +=
      lineHeight *
      Math.ceil((invoice.billingAddress.address?.length || 0) / 35);
    doc.text(
      `${invoice.billingAddress.city}, ${invoice.billingAddress.state} - ${invoice.billingAddress.pincode}`,
      leftColX,
      yPos,
      { width: colWidth }
    );
    yPos += lineHeight;
    doc.text(`Phone: ${invoice.billingAddress.phone}`, leftColX, yPos, {
      width: colWidth,
    });

    doc.fontSize(12).text("Ship To:", rightColX, addressY);
    doc.fontSize(10);
    let yPosRight = addressY + 18;
    doc.text(invoice.shippingAddress.name, rightColX, yPosRight, {
      width: colWidth,
    });
    yPosRight += lineHeight;
    doc.text(invoice.shippingAddress.address, rightColX, yPosRight, {
      width: colWidth,
    });
    yPosRight +=
      lineHeight *
      Math.ceil((invoice.shippingAddress.address?.length || 0) / 35);
    doc.text(
      `${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} - ${invoice.shippingAddress.pincode}`,
      rightColX,
      yPosRight,
      { width: colWidth }
    );
    yPosRight += lineHeight;
    doc.text(`Phone: ${invoice.shippingAddress.phone}`, rightColX, yPosRight, {
      width: colWidth,
    });

    const afterAddressY = Math.max(yPos, yPosRight) + 20;
    doc.y = afterAddressY;
    doc.moveDown();

    const tableY = doc.y;
    doc.fontSize(10);

    // Table headers
    doc.text("S.No.", 50, tableY);
    doc.text("Item Description", 100, tableY);
    doc.text("Qty", 300, tableY);
    doc.text("Rate (Rs)", 350, tableY);
    doc.text("Amount (Rs)", 420, tableY);
    doc.text("GST (Rs)", 490, tableY);

    doc
      .moveTo(50, tableY + 15)
      .lineTo(550, tableY + 15)
      .stroke();

    let currentY = tableY + 25;
    let totalAmount = 0;
    let totalGST = 0;

    invoice.items.forEach((item, index) => {
      const gstAmount = item.cgst + item.sgst + item.igst;
      totalAmount += item.totalPrice;
      totalGST += gstAmount;

      doc.text((index + 1).toString(), 50, currentY);
      doc.text(item.name, 100, currentY);
      doc.text(item.quantity.toString(), 300, currentY);
      doc.text(item.unitPrice.toFixed(2), 350, currentY);
      doc.text(item.totalPrice.toFixed(2), 420, currentY);
      doc.text(gstAmount.toFixed(2), 490, currentY);

      currentY += 20;
    });

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    // Totals
    doc.text("Subtotal:", 420, currentY);
    doc.text(`Rs ${invoice.subtotal.toFixed(2)}`, 490, currentY);
    currentY += 20;

    if (invoice.cgstTotal > 0) {
      doc.text("CGST (6%):", 420, currentY);
      doc.text(`Rs ${invoice.cgstTotal.toFixed(2)}`, 490, currentY);
      currentY += 20;
    }

    if (invoice.sgstTotal > 0) {
      doc.text("SGST (6%):", 420, currentY);
      doc.text(`Rs ${invoice.sgstTotal.toFixed(2)}`, 490, currentY);
      currentY += 20;
    }

    if (invoice.igstTotal > 0) {
      doc.text("IGST (12%):", 420, currentY);
      doc.text(`Rs ${invoice.igstTotal.toFixed(2)}`, 490, currentY);
      currentY += 20;
    }

    doc.text("Shipping:", 420, currentY);
    doc.text(`Rs ${invoice.shippingCharges.toFixed(2)}`, 490, currentY);
    currentY += 20;

    if (invoice.discount && invoice.discount > 0) {
      doc.text("Discount:", 420, currentY);
      doc.text(`- Rs ${Number(invoice.discount).toFixed(2)}`, 490, currentY);
      currentY += 20;
    }

    doc.fontSize(12).text("Total:", 420, currentY);
    doc
      .fontSize(12)
      .text(`Rs ${invoice.totalAmount.toFixed(2)}`, 490, currentY);
    currentY += 20;

    doc
      .fontSize(10)
      .text(`Amount in Words: ${invoice.amountInWords}`, 50, currentY + 10);

    // Terms and conditions
    doc.moveDown(2);
    doc.fontSize(10).text("Terms & Conditions:", 50);
    doc.fontSize(8).text(invoice.terms, 50);

    // Footer
    doc
      .fontSize(8)
      .text("This is a computer generated invoice", { align: "center" });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// Get all invoices - Admin => /api/v1/admin/invoices
exports.getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate("order")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// Update invoice - Admin => /api/v1/admin/invoice/:id
exports.updateInvoice = async (req, res, next) => {
  try {
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return next(new ErrorHandler("Invoice not found", 404));
    }

    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Delete invoice - Admin => /api/v1/admin/invoice/:id
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return next(new ErrorHandler("Invoice not found", 404));
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
