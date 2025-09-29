const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  billingAddress: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  shippingAddress: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      gstRate: {
        type: Number,
        default: 12,
      },
      cgst: {
        type: Number,
        required: true,
      },
      sgst: {
        type: Number,
        required: true,
      },
      igst: {
        type: Number,
        default: 0,
      },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  cgstTotal: {
    type: Number,
    required: true,
  },
  sgstTotal: {
    type: Number,
    required: true,
  },
  igstTotal: {
    type: Number,
    default: 0,
  },
  shippingCharges: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amountInWords: {
    type: String,
    required: true,
    default: "",
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending", "Overdue"],
    default: "Paid",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: "",
  },
  terms: {
    type: String,
    default: "Payment is due within 30 days of invoice date.",
  },
  companyInfo: {
    name: {
      type: String,
      default: "Ghee E-commerce Pvt. Ltd.",
    },
    address: {
      type: String,
      default: "123 Ghee Street, Dairy District, Mumbai - 400001",
    },
    gstin: {
      type: String,
      default: "27AABCG1234A1Z5",
    },
    pan: {
      type: String,
      default: "AABCG1234A",
    },
    phone: {
      type: String,
      default: "+91-22-12345678",
    },
    email: {
      type: String,
      default: "accounts@ghee-ecommerce.com",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate invoice number before saving
invoiceSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.invoiceNumber = `INV-${year}${month}-${random}`;
  }

  // Set due date to 30 days from invoice date
  if (!this.dueDate) {
    this.dueDate = new Date(
      this.invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
  }

  if (!this.amountInWords && this.totalAmount) {
    this.amountInWords = this.amountToWords(this.totalAmount);
  }

  next();
});

// Method to calculate GST based on billing and shipping state
invoiceSchema.methods.calculateGST = function () {
  const isSameState = this.billingAddress.state === this.shippingAddress.state;

  this.items.forEach((item) => {
    const gstAmount = (item.totalPrice * item.gstRate) / 100;

    if (isSameState) {
      item.cgst = gstAmount / 2;
      item.sgst = gstAmount / 2;
      item.igst = 0;
    } else {
      item.cgst = 0;
      item.sgst = 0;
      item.igst = gstAmount;
    }
  });

  // Calculate totals
  this.cgstTotal = this.items.reduce((sum, item) => sum + item.cgst, 0);
  this.sgstTotal = this.items.reduce((sum, item) => sum + item.sgst, 0);
  this.igstTotal = this.items.reduce((sum, item) => sum + item.igst, 0);
};

// Method to convert amount to words
invoiceSchema.methods.amountToWords = function (amount) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const convertLessThanOneThousand = (num) => {
    if (num === 0) return "";

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " and " + convertLessThanOneThousand(num % 100) : "")
      );
  };

  const convert = (num) => {
    if (num === 0) return "Zero Rupees Only";

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = "";

    if (crore > 0) result += convertLessThanOneThousand(crore) + " Crore ";
    if (lakh > 0) result += convertLessThanOneThousand(lakh) + " Lakh ";
    if (thousand > 0)
      result += convertLessThanOneThousand(thousand) + " Thousand ";
    if (remainder > 0) result += convertLessThanOneThousand(remainder);

    return result.trim() + " Rupees Only";
  };

  return convert(Math.floor(amount));
};

module.exports = mongoose.model("Invoice", invoiceSchema);
