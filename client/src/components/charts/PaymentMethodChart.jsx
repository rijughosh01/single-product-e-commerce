"use client";

import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function PaymentMethodChart({ data = {} }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">💳</div>
          <p>No payment method data available</p>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    {
      name: "Razorpay",
      count: data.razorpay?.count || 0,
      amount: data.razorpay?.amount || 0,
      color: "rgba(59, 130, 246, 0.8)",
      borderColor: "rgb(59, 130, 246)",
    },
    {
      name: "Cash on Delivery",
      count: data.cod?.count || 0,
      amount: data.cod?.amount || 0,
      color: "rgba(16, 185, 129, 0.8)",
      borderColor: "rgb(16, 185, 129)",
    },
  ];

  const totalAmount = paymentMethods.reduce(
    (sum, method) => sum + method.amount,
    0
  );
  const totalCount = paymentMethods.reduce(
    (sum, method) => sum + method.count,
    0
  );

  const doughnutData = {
    labels: paymentMethods.map((method) => method.name),
    datasets: [
      {
        data: paymentMethods.map((method) => method.amount),
        backgroundColor: paymentMethods.map((method) => method.color),
        borderColor: paymentMethods.map((method) => method.borderColor),
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: paymentMethods.map((method) => method.name),
    datasets: [
      {
        label: "Number of Transactions",
        data: paymentMethods.map((method) => method.count),
        backgroundColor: paymentMethods.map((method) => method.color),
        borderColor: paymentMethods.map((method) => method.borderColor),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const percentage =
              totalAmount > 0
                ? ((context.parsed / totalAmount) * 100).toFixed(1)
                : 0;
            return `${context.label}: ₹${context.parsed.toLocaleString(
              "en-IN"
            )} (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return `Transactions: ${context.parsed.y.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
          callback: function (value) {
            return value.toLocaleString("en-IN");
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Razorpay</p>
              <p className="text-2xl font-bold text-blue-900">
                ₹{paymentMethods[0].amount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-blue-600">
                {paymentMethods[0].count} transactions
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Cash on Delivery
              </p>
              <p className="text-2xl font-bold text-green-900">
                ₹{paymentMethods[1].amount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-green-600">
                {paymentMethods[1].count} transactions
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-600">{totalCount} transactions</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction Count
          </h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
