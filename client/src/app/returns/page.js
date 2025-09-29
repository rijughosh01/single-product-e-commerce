"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, CreditCard, ClipboardCheck, Truck } from "lucide-react";

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="text-amber-700 bg-amber-100 mb-4"
          >
            Policy
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Returns & Refunds
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Shop with confidence. Learn how returns, replacements, and refunds
            work at Pure Ghee.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <RefreshCcw className="w-6 h-6 text-amber-600" />,
              title: "30-Day Easy Returns",
              desc: "Return unopened items within 30 days of delivery.",
            },
            {
              icon: <ClipboardCheck className="w-6 h-6 text-amber-600" />,
              title: "Hassle-free Approval",
              desc: "Most requests are approved within 24-48 hours.",
            },
            {
              icon: <Truck className="w-6 h-6 text-amber-600" />,
              title: "Pickup or Drop-off",
              desc: "Courier pickup available in serviceable areas.",
            },
            {
              icon: <CreditCard className="w-6 h-6 text-amber-600" />,
              title: "Fast Refunds",
              desc: "Refunds issued to original payment method within 5-7 days.",
            },
          ].map((c, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  {c.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {c.title}
                </h3>
                <p className="text-gray-600 text-sm">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Policy Details */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Eligibility
                </h2>
                <p className="text-gray-600">
                  Items must be unused, sealed, and in their original packaging.
                  Opened consumables are not eligible for return unless damaged
                  or defective on arrival.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  How to Initiate a Return
                </h2>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>
                    Login and visit{" "}
                    <span className="text-amber-600">Orders</span> → select the
                    item.
                  </li>
                  <li>
                    Choose <strong>Return/Replace</strong> and provide reason
                    with photos if damaged.
                  </li>
                  <li>
                    Choose pickup or courier drop and confirm your request.
                  </li>
                </ol>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Replacement Policy
                </h2>
                <p className="text-gray-600">
                  If your product arrives damaged, leaking, or incorrect, we
                  will replace it at no extra cost. Replacement is subject to
                  stock availability; otherwise a full refund is provided.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Refund Timelines
                </h2>
                <p className="text-gray-600">
                  After we receive and inspect the item, refunds are processed
                  within 48 hours. Banks may take 3-5 business days to reflect
                  the amount. COD orders are refunded to bank account or UPI.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Non-returnable Items
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Items past 30 days from delivery</li>
                  <li>
                    Opened or partially used consumables without quality issues
                  </li>
                  <li>Items without original packaging</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Exchange & Store Credit
                </h2>
                <p className="text-gray-600">
                  Prefer an exchange or store credit instead of a refund? Choose
                  your preference during the return request. Store credits never
                  expire.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Return Shipping Charges
                </h2>
                <p className="text-gray-600">
                  Return pickup is free for damaged/wrong items. For
                  discretionary returns, a nominal pickup fee may be deducted
                  from the refund.
                </p>
              </div>
              <p className="text-gray-600">
                Need help?{" "}
                <a
                  href="/contact"
                  className="text-amber-600 hover:text-amber-700"
                >
                  Contact Support
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
