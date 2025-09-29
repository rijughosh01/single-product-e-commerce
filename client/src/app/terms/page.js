"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="text-amber-700 bg-amber-100 mb-4"
          >
            Legal
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            These terms govern your use of the Pure Ghee website and services.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 space-y-8 text-gray-600">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By using our site, you agree to these Terms and our Privacy
                  Policy. If you do not agree, please discontinue use.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  2. Accounts & Security
                </h2>
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account and for all activities under your account.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  3. Orders & Payments
                </h2>
                <p>
                  All prices are inclusive of applicable taxes unless stated.
                  Orders are subject to availability and confirmation of
                  payment.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  4. Pricing & Errors
                </h2>
                <p>
                  Despite our best efforts, a small number of products may be
                  mispriced. If a pricing error is discovered, we will contact
                  you with the option to cancel or proceed at the corrected
                  price.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  5. Shipping & Returns
                </h2>
                <p>
                  Delivery timelines and return eligibility are described in our{" "}
                  <a
                    href="/shipping"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    Shipping
                  </a>{" "}
                  and{" "}
                  <a
                    href="/returns"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    Returns
                  </a>{" "}
                  pages.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  6. Prohibited Activities
                </h2>
                <p>
                  You agree not to misuse the site, attempt unauthorized access,
                  or engage in fraudulent activity.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  7. Intellectual Property
                </h2>
                <p>
                  All content, trademarks, logos, and graphics are the property
                  of their respective owners and protected by applicable laws.
                  You may not use them without prior written permission.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  8. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, we are not liable for
                  indirect or consequential damages arising from use of our
                  services.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  9. Dispute Resolution
                </h2>
                <p>
                  Any dispute will first be attempted to be resolved amicably.
                  If unresolved, it shall be subject to the exclusive
                  jurisdiction of the courts of India.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  10. Changes to Terms
                </h2>
                <p>
                  We may update these Terms from time to time. Continued use
                  constitutes acceptance of the updated Terms.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                If you have questions about these Terms, please{" "}
                <a
                  href="/contact"
                  className="text-amber-600 hover:text-amber-700"
                >
                  contact us
                </a>
                .
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().getFullYear()}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
