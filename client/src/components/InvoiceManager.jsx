"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { invoiceAPI } from "@/lib/api";
import { toast } from "sonner";

const InvoiceManager = ({ className = "" }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceAPI.getMyInvoices();
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (orderId) => {
    setLoading(true);
    try {
      await invoiceAPI.generateInvoice(orderId);
      toast.success("Invoice generated successfully!");
      fetchInvoices();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to generate invoice";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoicePDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await invoiceAPI.downloadInvoicePDF(invoiceId);

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const viewInvoiceDetails = async (invoiceId) => {
    try {
      const response = await invoiceAPI.getInvoice(invoiceId);
      setSelectedInvoice(response.data.invoice);
      setShowInvoiceDetails(true);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.error("Failed to load invoice details");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.order?.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Invoice Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading invoices...</span>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No invoices found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "No invoices match your search criteria"
                : "You don't have any invoices yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Invoice #{invoice.invoiceNumber}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(invoice.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          Order #{invoice.order?.orderNumber || "N/A"}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatPrice(invoice.totalAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewInvoiceDetails(invoice._id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadInvoicePDF(invoice._id, invoice.invoiceNumber)
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice #{selectedInvoice.invoiceNumber}</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowInvoiceDetails(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <div className="text-sm text-gray-600">
                    <p>{selectedInvoice.billingAddress?.name}</p>
                    <p>{selectedInvoice.billingAddress?.address}</p>
                    <p>
                      {selectedInvoice.billingAddress?.city},{" "}
                      {selectedInvoice.billingAddress?.state}
                    </p>
                    <p>{selectedInvoice.billingAddress?.pincode}</p>
                    <p>{selectedInvoice.billingAddress?.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Invoice Details:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Invoice Date:</strong>{" "}
                      {formatDate(selectedInvoice.createdAt)}
                    </p>
                    <p>
                      <strong>Due Date:</strong>{" "}
                      {formatDate(selectedInvoice.dueDate)}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <Badge
                        className={`ml-2 ${getStatusColor(
                          selectedInvoice.status
                        )}`}
                      >
                        {selectedInvoice.status}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-semibold mb-3">Items:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Item</th>
                        <th className="text-right p-2">Quantity</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.description}
                              </p>
                            </div>
                          </td>
                          <td className="text-right p-2">{item.quantity}</td>
                          <td className="text-right p-2">
                            {formatPrice(item.price)}
                          </td>
                          <td className="text-right p-2">
                            {formatPrice(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST):</span>
                    <span>{formatPrice(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatPrice(selectedInvoice.shipping)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInvoiceDetails(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() =>
                    downloadInvoicePDF(
                      selectedInvoice._id,
                      selectedInvoice.invoiceNumber
                    )
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;
