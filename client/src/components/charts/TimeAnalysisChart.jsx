"use client";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TimeAnalysisChart({ data = {} }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">⏰</div>
          <p>No time analysis data available</p>
        </div>
      </div>
    );
  }

  const {
    hourlyDistribution = {},
    dailyDistribution = {},
    monthlyDistribution = {},
  } = data;

  // Hourly Analysis
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    orders: hourlyDistribution[hour]?.orders || 0,
    revenue: hourlyDistribution[hour]?.revenue || 0,
  }));

  // Daily Analysis
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dailyData = dayNames.map((day, index) => ({
    day,
    orders: dailyDistribution[index]?.orders || 0,
    revenue: dailyDistribution[index]?.revenue || 0,
  }));

  // Monthly Analysis
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthlyData = monthNames.map((month, index) => ({
    month,
    orders: monthlyDistribution[index]?.orders || 0,
    revenue: monthlyDistribution[index]?.revenue || 0,
  }));

  // Find peak hours
  const peakHour = hourlyData.reduce(
    (max, current) => (current.orders > max.orders ? current : max),
    hourlyData[0]
  );

  const peakDay = dailyData.reduce(
    (max, current) => (current.orders > max.orders ? current : max),
    dailyData[0]
  );

  const peakMonth = monthlyData.reduce(
    (max, current) => (current.orders > max.orders ? current : max),
    monthlyData[0]
  );

  // Hourly Chart Data
  const hourlyChartData = {
    labels: hourlyData.map((item) => `${item.hour}:00`),
    datasets: [
      {
        label: "Orders",
        data: hourlyData.map((item) => item.orders),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 2,
        borderSkipped: false,
      },
    ],
  };

  // Daily Chart Data
  const dailyChartData = {
    labels: dailyData.map((item) => item.day),
    datasets: [
      {
        label: "Orders",
        data: dailyData.map((item) => item.orders),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Monthly Chart Data
  const monthlyChartData = {
    labels: monthlyData.map((item) => item.month),
    datasets: [
      {
        label: "Orders",
        data: monthlyData.map((item) => item.orders),
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "rgb(245, 158, 11)",
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
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
            return `Orders: ${context.parsed.y.toLocaleString("en-IN")}`;
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
            size: 11,
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
    <div className="space-y-8">
      {/* Peak Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Peak Hour</p>
              <p className="text-2xl font-bold text-blue-900">
                {peakHour.hour}:00
              </p>
              <p className="text-xs text-blue-600">{peakHour.orders} orders</p>
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Peak Day</p>
              <p className="text-2xl font-bold text-green-900">{peakDay.day}</p>
              <p className="text-xs text-green-600">{peakDay.orders} orders</p>
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Peak Month</p>
              <p className="text-2xl font-bold text-amber-900">
                {peakMonth.month}
              </p>
              <p className="text-xs text-amber-600">
                {peakMonth.orders} orders
              </p>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <svg
                className="w-6 h-6 text-amber-600"
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
      <div className="space-y-8">
        {/* Hourly Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hourly Order Distribution
          </h3>
          <div className="h-64">
            <Bar data={hourlyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Daily Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Order Distribution
          </h3>
          <div className="h-64">
            <Bar data={dailyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Monthly Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Order Distribution
          </h3>
          <div className="h-64">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">
              Peak Performance Times:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • Best hour: {peakHour.hour}:00 ({peakHour.orders} orders)
              </li>
              <li>
                • Best day: {peakDay.day} ({peakDay.orders} orders)
              </li>
              <li>
                • Best month: {peakMonth.month} ({peakMonth.orders} orders)
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Recommendations:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Focus marketing during peak hours</li>
              <li>• Schedule promotions on {peakDay.day}s</li>
              <li>• Plan inventory for {peakMonth.month}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
