"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We respect your privacy and are committed to protecting your
            personal data.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 space-y-8 text-gray-600">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Information We Collect
                </h2>
                <p>
                  We collect information you provide during account creation,
                  checkout, and support interactions, such as name, email,
                  phone, and address. We also collect device and usage
                  information using cookies to improve our services.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process and deliver your orders</li>
                  <li>Provide customer support and service updates</li>
                  <li>Improve website performance and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Data Retention
                </h2>
                <p>
                  We retain your personal information only for as long as
                  necessary to fulfill the purposes outlined in this policy,
                  comply with our legal obligations, resolve disputes, and
                  enforce our agreements.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sharing & Security
                </h2>
                <p>
                  We never sell your data. We share only with trusted partners
                  like payment gateways and logistics providers to fulfill your
                  order. We employ industry-standard encryption and access
                  controls to protect your data.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Third-Party Processors
                </h2>
                <p>
                  We use reputable service providers for payments, analytics,
                  communications, and shipping. These processors access data
                  only to perform services on our behalf under strict
                  confidentiality obligations.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Rights
                </h2>
                <p>
                  You can access, update, or delete your personal information
                  from your account settings, or request assistance via our{" "}
                  <a
                    href="/contact"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    Contact
                  </a>{" "}
                  page.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Children's Privacy
                </h2>
                <p>
                  Our services are not directed to children under 13. We do not
                  knowingly collect personal information from children. If you
                  believe a child has provided us information, please contact us
                  to remove it.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Cookies
                </h2>
                <p>
                  We use cookies to remember preferences, keep you signed in,
                  and analyze site performance. You may control cookies via your
                  browser settings; disabling cookies may impact functionality.
                </p>
              </div>
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
