"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Clock, Package, Shield } from "lucide-react";

export default function ShippingInfoPage() {
  const shippingOptions = [
    {
      icon: <Truck className="w-6 h-6 text-amber-600" />,
      title: "Free Shipping",
      description:
        "Free shipping on all orders above ₹1000 across India. Applied automatically at checkout.",
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      title: "Delivery Time",
      description:
        "Standard delivery: 3-5 business days. Express delivery: 1-2 business days in select cities.",
    },
    {
      icon: <Package className="w-6 h-6 text-amber-600" />,
      title: "Order Processing",
      description:
        "Orders placed before 12 PM are processed the same day. Weekend orders ship next business day.",
    },
    {
      icon: <Shield className="w-6 h-6 text-amber-600" />,
      title: "Secure Packaging",
      description:
        "All items are sealed and shipped in tamper-proof, insulated packaging to preserve freshness.",
    },
  ];

  const zones = [
    {
      title: "Metro Cities",
      time: "1-3 days",
      note: "Express option available",
    },
    {
      title: "Tier 2/3 Cities",
      time: "3-5 days",
      note: "Standard shipping",
    },
    {
      title: "Remote Locations",
      time: "5-7 days",
      note: "Subject to courier serviceability",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="text-amber-700 bg-amber-100 mb-4"
          >
            Shipping
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Shipping Information
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Learn about delivery timelines, charges, and packaging standards for
            your Pure Ghee orders.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {shippingOptions.map((item, idx) => (
            <Card key={idx} className="card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Zones */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Delivery Estimates
            </h2>
            <p className="text-gray-600">
              Approximate timelines based on destination
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {zones.map((z, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="p-6">
                  <div className="text-sm text-amber-600 font-medium mb-1">
                    {z.title}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {z.time}
                  </div>
                  <div className="text-gray-500 text-sm">{z.note}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rates & Charges */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Rates & Charges
            </h2>
            <p className="text-gray-600">
              Transparent pricing with free shipping above ₹1000
            </p>
          </div>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Standard
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Express
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Below ₹500</td>
                    <td className="px-6 py-4 text-gray-700">₹69</td>
                    <td className="px-6 py-4 text-gray-700">₹149</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">₹500 - ₹999</td>
                    <td className="px-6 py-4 text-gray-700">₹39</td>
                    <td className="px-6 py-4 text-gray-700">₹129</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">₹1000 and above</td>
                    <td className="px-6 py-4 text-green-600 font-medium">
                      Free
                    </td>
                    <td className="px-6 py-4 text-gray-700">₹99</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Process & Notes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Order to Delivery Process
              </h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                <li>Place order and receive confirmation by email/SMS.</li>
                <li>
                  We process and pack items in tamper-proof, insulated boxes.
                </li>
                <li>Courier pickup and tracking details shared with you.</li>
                <li>Out for delivery and delivered to your doorstep.</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  Cash-on-Delivery availability depends on courier partner
                  serviceability.
                </li>
                <li>
                  Once shipped, tracking details are shared via email and SMS.
                </li>
                <li>
                  Holidays and unforeseen delays may affect delivery timelines.
                </li>
                <li>
                  For queries, visit{" "}
                  <a
                    href="/contact"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    Contact Us
                  </a>
                  .
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
