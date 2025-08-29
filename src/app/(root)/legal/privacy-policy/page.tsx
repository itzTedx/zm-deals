import type { Metadata } from "next";

import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how ZM Deals collects, uses, and protects your personal information. Our privacy policy explains your rights and our data practices.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="prose prose-lg prose-gray container max-w-[80ch] py-8 sm:py-12">
      <div className="space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-muted-foreground">
            At ZM Deals, we are committed to protecting your privacy and ensuring the security of your personal
            information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
            you visit our website or use our services.
          </p>
        </header>

        <Separator />

        {/* Information We Collect */}
        <section>
          <h2>Information We Collect</h2>
          <div>
            <div>
              <h3>Personal Information</h3>
              <p>We may collect personal information that you voluntarily provide to us when you:</p>
              <ul>
                <li>Create an account or register on our website</li>
                <li>Place an order or make a purchase</li>
                <li>Subscribe to our newsletter or promotional emails</li>
                <li>Contact our customer support team</li>
                <li>Participate in surveys, contests, or promotions</li>
                <li>Leave reviews or feedback</li>
              </ul>
              <p>
                This information may include your name, email address, phone number, shipping address, billing address,
                payment information, and other contact details.
              </p>
            </div>

            <div>
              <h3>Automatically Collected Information</h3>
              <p>
                When you visit our website, we automatically collect certain information about your device, including:
              </p>
              <ul>
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on each page</li>
                <li>Referring website</li>
                <li>Device identifiers and cookies</li>
              </ul>
            </div>

            <div>
              <h3>Cookies and Tracking Technologies</h3>
              <p>
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze website
                traffic, and understand where our visitors are coming from. You can control cookie settings through your
                browser preferences.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2>How We Use Your Information</h2>
          <div>
            <p>We use the information we collect for various purposes, including:</p>
            <ul>
              <li>
                <strong>Order Processing:</strong> To process and fulfill your orders, send order confirmations, and
                provide customer support
              </li>
              <li>
                <strong>Account Management:</strong> To create and manage your account, verify your identity, and
                maintain your profile
              </li>
              <li>
                <strong>Communication:</strong> To send you important updates about your orders, respond to your
                inquiries, and provide customer service
              </li>
              <li>
                <strong>Marketing:</strong> To send you promotional offers, newsletters, and updates about new products
                and deals (with your consent)
              </li>
              <li>
                <strong>Website Improvement:</strong> To analyze website usage, improve our services, and enhance user
                experience
              </li>
              <li>
                <strong>Security:</strong> To protect against fraud, unauthorized access, and other security threats
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes
              </li>
            </ul>
          </div>
        </section>

        {/* Information Sharing */}
        <section>
          <h2>Information Sharing and Disclosure</h2>
          <div>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your
              consent, except in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>Service Providers:</strong> We may share information with trusted third-party service providers
                who assist us in operating our website, processing payments, and delivering orders
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information when required by law, court order, or
                government request
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your
                information may be transferred as part of the transaction
              </li>
              <li>
                <strong>Safety and Security:</strong> We may share information to protect the safety and security of our
                users, employees, or the public
              </li>
              <li>
                <strong>With Your Consent:</strong> We may share your information with third parties when you explicitly
                consent to such sharing
              </li>
            </ul>
          </div>
        </section>

        {/* Data Security */}
        <section>
          <h2>Data Security</h2>
          <div>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of sensitive data during transmission and storage</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication procedures</li>
              <li>Secure payment processing through Stripe</li>
              <li>Employee training on data protection practices</li>
            </ul>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive
              to protect your information, we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2>Your Rights and Choices</h2>
          <div>
            <p>Depending on your location, you may have certain rights regarding your personal information:</p>
            <ul>
              <li>
                <strong>Access:</strong> Request access to the personal information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)
              </li>
              <li>
                <strong>Portability:</strong> Request a copy of your data in a portable format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing communications at any time
              </li>
              <li>
                <strong>Cookie Preferences:</strong> Manage cookie settings through your browser
              </li>
            </ul>
            <p>To exercise these rights, please contact us using the information provided below.</p>
          </div>
        </section>

        {/* Data Retention */}
        <section>
          <h2>Data Retention</h2>
          <div>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is required or permitted by law. We will delete or
              anonymize your information when it is no longer needed for these purposes.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2>Children's Privacy</h2>
          <div>
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly collect personal
              information from children under 13. If you are a parent or guardian and believe your child has provided us
              with personal information, please contact us immediately.
            </p>
          </div>
        </section>

        {/* International Transfers */}
        <section>
          <h2>International Data Transfers</h2>
          <div>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure that such
              transfers comply with applicable data protection laws and implement appropriate safeguards to protect your
              information.
            </p>
          </div>
        </section>

        {/* Changes to Privacy Policy */}
        <section>
          <h2>Changes to This Privacy Policy</h2>
          <div>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable
              laws. We will notify you of any material changes by posting the updated policy on our website and updating
              the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2>Contact Us</h2>
          <div>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us:
            </p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> support@zmdeals.shop
              </p>
              <p>
                <strong>Phone:</strong> +971-XXX-XXXXXX
              </p>
            </div>
            <p>We will respond to your inquiry as soon as possible and within the timeframes required by law.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
