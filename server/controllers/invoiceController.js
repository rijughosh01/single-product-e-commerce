const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate invoice for an order => /api/v1/invoice/generate/:orderId
exports.generateInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('orderItems.product');

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ order: orderId });
    if (existingInvoice) {
      return res.status(200).json({
        success: true,
        message: 'Invoice already exists',
        invoice: existingInvoice
      });
    }

    // Get user's default address for billing
    const user = await User.findById(order.user._id);
    const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];

    if (!defaultAddress) {
      return next(new ErrorHandler('No billing address found', 400));
    }

    // Prepare invoice items
    const invoiceItems = order.orderItems.map(item => ({
      product: item.product._id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      gstRate: 18, // 18% GST for ghee
      cgst: 0,
      sgst: 0,
      igst: 0
    }));

    // Create invoice
    const invoice = await Invoice.create({
      order: orderId,
      user: order.user._id,
      billingAddress: {
        name: defaultAddress.name,
        address: defaultAddress.address,
        city: defaultAddress.city,
        state: defaultAddress.state,
        pincode: defaultAddress.pincode,
        phone: defaultAddress.phone
      },
      shippingAddress: {
        name: order.shippingInfo.name,
        address: order.shippingInfo.address,
        city: order.shippingInfo.city,
        state: order.shippingInfo.state,
        pincode: order.shippingInfo.pincode,
        phone: order.shippingInfo.phone
      },
      items: invoiceItems,
      subtotal: order.itemsPrice,
      shippingCharges: order.shippingPrice,
      totalAmount: order.totalPrice,
      paymentMethod: order.paymentInfo.method,
      paymentDate: order.paidAt
    });

    // Calculate GST
    invoice.calculateGST();
    
    // Set amount in words
    invoice.amountInWords = invoice.amountToWords(invoice.totalAmount);
    
    await invoice.save();

    res.status(201).json({
      success: true,
      invoice
    });
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID => /api/v1/invoice/:id
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('order')
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!invoice) {
      return next(new ErrorHandler('Invoice not found', 404));
    }

    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    next(error);
  }
};

// Get user's invoices => /api/v1/invoices/me
exports.getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate('order')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices
    });
  } catch (error) {
    next(error);
  }
};

// Download invoice PDF => /api/v1/invoice/:id/pdf
exports.downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('order')
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!invoice) {
      return next(new ErrorHandler('Invoice not found', 404));
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add company header
    doc.fontSize(20).text(invoice.companyInfo.name, { align: 'center' });
    doc.fontSize(10).text(invoice.companyInfo.address, { align: 'center' });
    doc.fontSize(10).text(`GSTIN: ${invoice.companyInfo.gstin} | PAN: ${invoice.companyInfo.pan}`, { align: 'center' });
    doc.fontSize(10).text(`Phone: ${invoice.companyInfo.phone} | Email: ${invoice.companyInfo.email}`, { align: 'center' });
    
    doc.moveDown();

    // Invoice details
    doc.fontSize(16).text('TAX INVOICE', { align: 'center' });
    doc.moveDown();

    // Invoice info table
    const invoiceInfoY = doc.y;
    doc.fontSize(10);
    doc.text('Invoice Number:', 50, invoiceInfoY);
    doc.text(invoice.invoiceNumber, 200, invoiceInfoY);
    
    doc.text('Invoice Date:', 50, invoiceInfoY + 20);
    doc.text(new Date(invoice.invoiceDate).toLocaleDateString('en-IN'), 200, invoiceInfoY + 20);
    
    doc.text('Due Date:', 50, invoiceInfoY + 40);
    doc.text(new Date(invoice.dueDate).toLocaleDateString('en-IN'), 200, invoiceInfoY + 40);

    doc.text('Payment Status:', 350, invoiceInfoY);
    doc.text(invoice.paymentStatus, 450, invoiceInfoY);
    
    doc.text('Payment Method:', 350, invoiceInfoY + 20);
    doc.text(invoice.paymentMethod, 450, invoiceInfoY + 20);

    doc.moveDown(3);

    // Billing and shipping addresses
    const addressY = doc.y;
    doc.fontSize(12).text('Bill To:', 50, addressY);
    doc.fontSize(10);
    doc.text(invoice.billingAddress.name, 50, addressY + 20);
    doc.text(invoice.billingAddress.address, 50, addressY + 35);
    doc.text(`${invoice.billingAddress.city}, ${invoice.billingAddress.state} - ${invoice.billingAddress.pincode}`, 50, addressY + 50);
    doc.text(`Phone: ${invoice.billingAddress.phone}`, 50, addressY + 65);

    doc.fontSize(12).text('Ship To:', 350, addressY);
    doc.fontSize(10);
    doc.text(invoice.shippingAddress.name, 350, addressY + 20);
    doc.text(invoice.shippingAddress.address, 350, addressY + 35);
    doc.text(`${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} - ${invoice.shippingAddress.pincode}`, 350, addressY + 50);
    doc.text(`Phone: ${invoice.shippingAddress.phone}`, 350, addressY + 65);

    doc.moveDown(4);

    // Items table
    const tableY = doc.y;
    doc.fontSize(10);
    
    // Table headers
    doc.text('S.No.', 50, tableY);
    doc.text('Item Description', 100, tableY);
    doc.text('Qty', 300, tableY);
    doc.text('Rate (₹)', 350, tableY);
    doc.text('Amount (₹)', 420, tableY);
    doc.text('GST (₹)', 490, tableY);
    
    doc.moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();
    
    let currentY = tableY + 25;
    let totalAmount = 0;
    let totalGST = 0;

    // Table rows
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
    doc.text('Subtotal:', 420, currentY);
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, 490, currentY);
    currentY += 20;

    if (invoice.cgstTotal > 0) {
      doc.text('CGST (9%):', 420, currentY);
      doc.text(`₹${invoice.cgstTotal.toFixed(2)}`, 490, currentY);
      currentY += 20;
    }

    if (invoice.sgstTotal > 0) {
      doc.text('SGST (9%):', 420, currentY);
      doc.text(`₹${invoice.sgstTotal.toFixed(2)}`, 490, currentY);
      currentY += 20;
    }

    if (invoice.igstTotal > 0) {
      doc.text('IGST (18%):', 420, currentY);
      doc.text(`₹${invoice.igstTotal.toFixed(2)}`, 490, currentY);
      currentY += 20;
    }

    doc.text('Shipping:', 420, currentY);
    doc.text(`₹${invoice.shippingCharges.toFixed(2)}`, 490, currentY);
    currentY += 20;

    doc.fontSize(12).text('Total:', 420, currentY);
    doc.fontSize(12).text(`₹${invoice.totalAmount.toFixed(2)}`, 490, currentY);
    currentY += 20;

    doc.fontSize(10).text(`Amount in Words: ${invoice.amountInWords}`, 50, currentY + 10);

    // Terms and conditions
    doc.moveDown(2);
    doc.fontSize(10).text('Terms & Conditions:', 50);
    doc.fontSize(8).text(invoice.terms, 50);

    // Footer
    doc.fontSize(8).text('This is a computer generated invoice', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// Get all invoices - Admin => /api/v1/admin/invoices
exports.getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate('order')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices
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
      return next(new ErrorHandler('Invoice not found', 404));
    }

    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    });

    res.status(200).json({
      success: true,
      invoice
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
      return next(new ErrorHandler('Invoice not found', 404));
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
