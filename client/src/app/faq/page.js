"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    q: "How can I track my order?",
    a: "Login to your account and open 'Orders'. You'll also receive tracking via email/SMS.",
  },
  {
    q: "What are the shipping charges?",
    a: "Shipping is free for orders above ₹1000. Standard rates apply below the threshold.",
  },
  {
    q: "Are your products organic?",
    a: "Yes. We source from certified farms and follow traditional, transparent methods.",
  },
  {
    q: "What is your return policy?",
    a: "30-day easy returns on unopened items. Damaged/defective items are replaced or refunded.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship within India. We are working to add international options soon.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="text-amber-700 bg-amber-100 mb-4"
          >
            Help
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Quick answers to the most common questions about our products and
            services.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {faqs.map((item, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.q}
                </h3>
                <p className="text-gray-600">{item.a}</p>
              </CardContent>
            </Card>
          ))}
          <p className="text-gray-600 text-center">
            Still need help?{" "}
            <a href="/contact" className="text-amber-600 hover:text-amber-700">
              Contact our team
            </a>
            .
          </p>
        </div>
      </section>

      {/* Helpful Links */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Shipping Information",
              desc: "Timelines, charges and packaging standards",
              href: "/shipping",
            },
            {
              title: "Returns & Refunds",
              desc: "Eligibility, steps and timelines",
              href: "/returns",
            },
            {
              title: "Contact Support",
              desc: "Reach out for anything else",
              href: "/contact",
            },
          ].map((l, i) => (
            <Card key={i} className="text-center card-hover">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {l.title}
                </h3>
                <p className="text-gray-600 mb-4">{l.desc}</p>
                <a
                  href={l.href}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Learn more →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
