import type { Metadata } from "next";

import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read ZM Deals' terms and conditions. Understand the rules, rights, and responsibilities when using our platform and services.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="prose prose-lg prose-gray container max-w-[80ch] py-8 sm:py-12">
      <div className="space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1>Terms and Conditions</h1>
          <p className="text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-muted-foreground">
            These Terms and Conditions govern your use of ZM Deals' website and services. By accessing or using our
            platform, you agree to be bound by these terms. Please read them carefully before making any purchases or
            using our services.
          </p>
        </header>

        <Separator />

        {/* Acceptance of Terms */}
        <section>
          <h2>Acceptance of Terms</h2>
          <div>
            <p>
              By accessing and using ZM Deals' website, mobile application, or any of our services, you acknowledge that
              you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to
              these terms, please do not use our services.
            </p>
            <p>
              These terms apply to all users of our platform, including customers, vendors, and visitors. We reserve the
              right to modify these terms at any time, and such modifications will be effective immediately upon
              posting.
            </p>
          </div>
        </section>

        {/* Account Registration */}
        <section>
          <h2>Account Registration and Security</h2>
          <div>
            <p>To access certain features of our platform, you may be required to create an account:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> You must provide accurate, current, and complete information when
                creating your account
              </li>
              <li>
                <strong>Password Security:</strong> You are responsible for maintaining the confidentiality of your
                password and account credentials
              </li>
              <li>
                <strong>Account Activity:</strong> You are responsible for all activities that occur under your account
              </li>
              <li>
                <strong>Account Termination:</strong> We reserve the right to terminate accounts that violate these
                terms or engage in fraudulent activity
              </li>
              <li>
                <strong>Age Requirement:</strong> You must be at least 18 years old to create an account and make
                purchases
              </li>
            </ul>
          </div>
        </section>

        {/* Product Information */}
        <section>
          <h2>Product Information and Pricing</h2>
          <div>
            <p>We strive to provide accurate product information, but please note:</p>
            <ul>
              <li>
                <strong>Product Descriptions:</strong> Product descriptions, images, and specifications are provided for
                informational purposes only
              </li>
              <li>
                <strong>Pricing:</strong> All prices are subject to change without notice. Prices are displayed in UAE
                Dirhams (AED) unless otherwise stated
              </li>
              <li>
                <strong>Availability:</strong> Product availability is subject to change. We reserve the right to cancel
                orders for out-of-stock items
              </li>
              <li>
                <strong>Errors:</strong> We reserve the right to correct any pricing errors and cancel orders affected
                by such errors
              </li>
              <li>
                <strong>Third-Party Products:</strong> Some products may be sold by third-party vendors with their own
                terms and policies
              </li>
            </ul>
          </div>
        </section>

        {/* Ordering and Payment */}
        <section>
          <h2>Ordering and Payment Terms</h2>
          <div>
            <p>When placing orders through our platform:</p>
            <ul>
              <li>
                <strong>Order Confirmation:</strong> Orders are confirmed when payment is successfully processed
              </li>
              <li>
                <strong>Payment Methods:</strong> We accept various payment methods including credit cards, debit cards,
                PayPal, and bank transfers
              </li>
              <li>
                <strong>Payment Processing:</strong> All payments are processed securely through our payment partners
              </li>
              <li>
                <strong>Order Cancellation:</strong> Orders may be cancelled before shipping. Once shipped, standard
                return policies apply
              </li>
              <li>
                <strong>Order Modifications:</strong> Order modifications may be possible before processing begins
              </li>
              <li>
                <strong>Taxes and Duties:</strong> Customers are responsible for any applicable taxes, duties, or import
                fees
              </li>
            </ul>
          </div>
        </section>

        {/* Shipping and Delivery */}
        <section>
          <h2>Shipping and Delivery</h2>
          <div>
            <p>All products are shipped from our UAE warehouse:</p>
            <ul>
              <li>
                <strong>Shipping Location:</strong> All orders are processed and shipped from our warehouse in the
                United Arab Emirates
              </li>
              <li>
                <strong>Delivery Times:</strong> Estimated delivery times are provided but may vary due to customs,
                weather, or other factors
              </li>
              <li>
                <strong>Shipping Costs:</strong> Shipping costs are calculated based on destination and selected
                shipping method
              </li>
              <li>
                <strong>Risk of Loss:</strong> Risk of loss and title for items purchased pass to you upon delivery to
                the carrier
              </li>
              <li>
                <strong>Delivery Issues:</strong> Customers must report delivery issues within 48 hours of expected
                delivery
              </li>
            </ul>
          </div>
        </section>

        {/* Returns and Refunds */}
        <section>
          <h2>Returns and Refunds</h2>
          <div>
            <p>Our return and refund policies are as follows:</p>
            <ul>
              <li>
                <strong>Return Window:</strong> Most items may be returned within 30 days of delivery
              </li>
              <li>
                <strong>Return Conditions:</strong> Items must be in original condition with all packaging and
                accessories
              </li>
              <li>
                <strong>Non-Returnable Items:</strong> Digital products, personalized items, and certain categories may
                not be returned
              </li>
              <li>
                <strong>Refund Processing:</strong> Refunds are processed within 5-7 business days of receiving returned
                items
              </li>
              <li>
                <strong>Restocking Fees:</strong> Restocking fees may apply to certain returns
              </li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2>Intellectual Property Rights</h2>
          <div>
            <p>All content on our platform is protected by intellectual property laws:</p>
            <ul>
              <li>
                <strong>Ownership:</strong> All content, including text, images, logos, and software, is owned by ZM
                Deals or our licensors
              </li>
              <li>
                <strong>Use License:</strong> We grant you a limited, non-exclusive license to access and use our
                platform for personal, non-commercial purposes
              </li>
              <li>
                <strong>Restrictions:</strong> You may not copy, modify, distribute, or create derivative works without
                our written permission
              </li>
              <li>
                <strong>Trademarks:</strong> ZM Deals trademarks and logos are protected and may not be used without
                permission
              </li>
              <li>
                <strong>User Content:</strong> By submitting content, you grant us a license to use it for platform
                purposes
              </li>
            </ul>
          </div>
        </section>

        {/* Prohibited Activities */}
        <section>
          <h2>Prohibited Activities</h2>
          <div>
            <p>You agree not to engage in the following activities:</p>
            <ul>
              <li>
                <strong>Fraudulent Activity:</strong> Creating false accounts, using stolen payment methods, or engaging
                in any fraudulent behavior
              </li>
              <li>
                <strong>Unauthorized Access:</strong> Attempting to gain unauthorized access to our systems or other
                users' accounts
              </li>
              <li>
                <strong>Spam and Harassment:</strong> Sending spam, harassing other users, or engaging in abusive
                behavior
              </li>
              <li>
                <strong>Illegal Activities:</strong> Using our platform for any illegal purposes or activities
              </li>
              <li>
                <strong>System Interference:</strong> Interfering with the operation of our platform or servers
              </li>
              <li>
                <strong>Content Violations:</strong> Posting inappropriate, offensive, or illegal content
              </li>
            </ul>
          </div>
        </section>

        {/* Privacy and Data */}
        <section>
          <h2>Privacy and Data Protection</h2>
          <div>
            <p>Your privacy is important to us:</p>
            <ul>
              <li>
                <strong>Privacy Policy:</strong> Our collection and use of your personal information is governed by our
                Privacy Policy
              </li>
              <li>
                <strong>Data Security:</strong> We implement appropriate security measures to protect your information
              </li>
              <li>
                <strong>Data Sharing:</strong> We may share your information with service providers and as required by
                law
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies and similar technologies to enhance your experience
              </li>
              <li>
                <strong>Your Rights:</strong> You have certain rights regarding your personal information as outlined in
                our Privacy Policy
              </li>
            </ul>
          </div>
        </section>

        {/* Disclaimers */}
        <section>
          <h2>Disclaimers and Limitations</h2>
          <div>
            <p>We provide our services "as is" with the following disclaimers:</p>
            <ul>
              <li>
                <strong>Service Availability:</strong> We do not guarantee uninterrupted access to our platform
              </li>
              <li>
                <strong>Product Warranties:</strong> Product warranties are provided by manufacturers, not ZM Deals
              </li>
              <li>
                <strong>Third-Party Content:</strong> We are not responsible for content provided by third-party vendors
                or users
              </li>
              <li>
                <strong>Technical Issues:</strong> We are not liable for technical issues beyond our reasonable control
              </li>
              <li>
                <strong>Limitation of Liability:</strong> Our liability is limited to the amount you paid for the
                specific product or service
              </li>
            </ul>
          </div>
        </section>

        {/* Indemnification */}
        <section>
          <h2>Indemnification</h2>
          <div>
            <p>
              You agree to indemnify and hold harmless ZM Deals, its officers, directors, employees, and agents from any
              claims, damages, losses, or expenses arising from:
            </p>
            <ul>
              <li>Your use of our platform or services</li>
              <li>Your violation of these Terms and Conditions</li>
              <li>Your violation of any applicable laws or regulations</li>
              <li>Your content or communications on our platform</li>
              <li>Any third-party claims related to your use of our services</li>
            </ul>
          </div>
        </section>

        {/* Termination */}
        <section>
          <h2>Termination</h2>
          <div>
            <p>These terms remain in effect until terminated:</p>
            <ul>
              <li>
                <strong>Your Termination:</strong> You may terminate your account at any time by contacting us
              </li>
              <li>
                <strong>Our Termination:</strong> We may terminate or suspend your account for violations of these terms
              </li>
              <li>
                <strong>Effect of Termination:</strong> Upon termination, your right to use our services ceases
                immediately
              </li>
              <li>
                <strong>Surviving Provisions:</strong> Certain provisions survive termination, including intellectual
                property and indemnification clauses
              </li>
            </ul>
          </div>
        </section>

        {/* Governing Law */}
        <section>
          <h2>Governing Law and Dispute Resolution</h2>
          <div>
            <p>These terms are governed by UAE law:</p>
            <ul>
              <li>
                <strong>Governing Law:</strong> These terms are governed by the laws of the United Arab Emirates
              </li>
              <li>
                <strong>Jurisdiction:</strong> Disputes will be resolved in the courts of the UAE
              </li>
              <li>
                <strong>Dispute Resolution:</strong> We encourage resolution through direct communication first
              </li>
              <li>
                <strong>Arbitration:</strong> Certain disputes may be resolved through binding arbitration
              </li>
              <li>
                <strong>Class Action Waiver:</strong> You waive any right to participate in class action lawsuits
              </li>
            </ul>
          </div>
        </section>

        {/* Changes to Terms */}
        <section>
          <h2>Changes to Terms and Conditions</h2>
          <div>
            <p>We may update these terms from time to time:</p>
            <ul>
              <li>
                <strong>Notification:</strong> We will notify users of material changes via email or website notice
              </li>
              <li>
                <strong>Effective Date:</strong> Changes become effective immediately upon posting
              </li>
              <li>
                <strong>Continued Use:</strong> Continued use of our services constitutes acceptance of updated terms
              </li>
              <li>
                <strong>Review:</strong> We encourage you to review these terms periodically
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2>Contact Information</h2>
          <div>
            <p>If you have questions about these Terms and Conditions or need assistance, please contact us:</p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> support@zmdeals.shop
              </p>
              <p>
                <strong>Phone:</strong> +971-XXX-XXXXXX
              </p>
              <p>
                <strong>Response Time:</strong> We typically respond within 24 hours during business days
              </p>
            </div>
            <p>
              These Terms and Conditions constitute the entire agreement between you and ZM Deals regarding your use of
              our platform and services.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
