"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export function RevenueChart({ data, timeRange }) {
  const hasData =
    data.labels &&
    data.labels.length > 0 &&
    data.values &&
    data.values.length > 0;

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: "Revenue",
        data: data.values || [],
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString();
          },
        },
      },
    },
  };

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No Revenue Data</p>
          <p className="text-sm">
            No revenue data available for the selected period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function OrderStatusChart({ data }) {
  const hasData =
    data.labels &&
    data.labels.length > 0 &&
    data.values &&
    data.values.length > 0;

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        data: data.values || [],
        backgroundColor: [
          "rgba(255, 193, 7, 0.8)",
          "rgba(13, 110, 253, 0.8)",
          "rgba(102, 16, 242, 0.8)",
          "rgba(25, 135, 84, 0.8)",
          "rgba(220, 53, 69, 0.8)",
        ],
        borderColor: [
          "rgba(255, 193, 7, 1)",
          "rgba(13, 110, 253, 1)",
          "rgba(102, 16, 242, 1)",
          "rgba(25, 135, 84, 1)",
          "rgba(220, 53, 69, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No Order Data</p>
          <p className="text-sm">
            No order data available for the selected period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export function TopProductsChart({ data }) {
  const hasData =
    data.labels &&
    data.labels.length > 0 &&
    data.values &&
    data.values.length > 0;

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: "Sales",
        data: data.values || [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No Product Sales Data</p>
          <p className="text-sm">
            No product sales data available for the selected period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function UserGrowthChart({ data }) {
  const hasData =
    data.labels &&
    data.labels.length > 0 &&
    data.values &&
    data.values.length > 0;

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: "New Users",
        data: data.values || [],
        backgroundColor: "rgba(102, 16, 242, 0.1)",
        borderColor: "rgba(102, 16, 242, 1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No User Growth Data</p>
          <p className="text-sm">
            No user growth data available for the selected period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}
