import type { Metadata } from "next";

import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Refund and Returns Policy",
  description:
    "Learn about ZM Deals' refund and returns policy. Understand our return process, eligibility criteria, and how to request refunds for your purchases.",
};

export default function RefundAndReturnsPolicyPage() {
  return (
    <div className="prose prose-lg prose-gray container max-w-[80ch] py-8 sm:py-12">
      <div className="space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1>Refund and Returns Policy</h1>
          <p className="text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-muted-foreground">
            At ZM Deals, we want you to be completely satisfied with your purchase. This policy outlines our refund and
            returns process, eligibility criteria, and how to request a refund or return for items purchased through our
            platform.
          </p>
        </header>

        <Separator />

        {/* Return Eligibility */}
        <section>
          <h2>Return Eligibility</h2>
          <div>
            <p>
              Most items purchased through ZM Deals are eligible for return within 30 days of delivery, subject to the
              following conditions:
            </p>
            <ul>
              <li>Item must be in its original condition and packaging</li>
              <li>All original tags, labels, and accessories must be included</li>
              <li>Item must not show signs of use, wear, or damage</li>
              <li>Digital products and downloadable content are generally non-refundable</li>
              <li>Personalized or custom-made items may not be eligible for return</li>
              <li>Items marked as "Final Sale" or "Non-Returnable" cannot be returned</li>
            </ul>
          </div>
        </section>

        {/* Non-Returnable Items */}
        <section>
          <h2>Non-Returnable Items</h2>
          <div>
            <p>The following items are generally not eligible for return:</p>
            <ul>
              <li>Digital products, software, and downloadable content</li>
              <li>Gift cards and promotional codes</li>
              <li>Personalized or custom-made items</li>
              <li>Items marked as "Final Sale" or "Non-Returnable"</li>
              <li>Perishable goods and consumables</li>
              <li>Items that have been used, damaged, or modified</li>
              <li>Items missing original packaging or accessories</li>
              <li>Items purchased from third-party sellers (subject to their individual policies)</li>
            </ul>
          </div>
        </section>

        {/* Return Process */}
        <section>
          <h2>How to Return an Item</h2>
          <div>
            <p>To initiate a return, please follow these steps:</p>
            <ol>
              <li>
                <strong>Contact Customer Support:</strong> Email us at support@zmdeals.shop within 30 days of delivery
                with your order number and reason for return
              </li>
              <li>
                <strong>Receive Return Authorization:</strong> We will review your request and provide a Return
                Authorization Number (RAN) if approved
              </li>
              <li>
                <strong>Package Your Item:</strong> Securely package the item in its original packaging with all
                accessories and tags
              </li>
              <li>
                <strong>Ship the Return:</strong> Use the provided shipping label or ship to our returns address with
                tracking information
              </li>
              <li>
                <strong>Wait for Processing:</strong> Once we receive your return, we will inspect it and process your
                refund within 5-7 business days
              </li>
            </ol>
          </div>
        </section>

        {/* Return Shipping */}
        <section>
          <h2>Return Shipping</h2>
          <div>
            <p>Return shipping costs are handled as follows:</p>
            <ul>
              <li>
                <strong>Defective Items:</strong> We cover return shipping costs for items that arrive damaged or
                defective
              </li>
              <li>
                <strong>Wrong Items:</strong> We cover return shipping costs if we sent you the wrong item
              </li>
              <li>
                <strong>Customer Preference Returns:</strong> Customers are responsible for return shipping costs for
                items returned due to preference (size, color, style, etc.)
              </li>
              <li>
                <strong>International Returns:</strong> International customers are responsible for all return shipping
                costs and customs duties
              </li>
            </ul>
            <p>We recommend using a trackable shipping method and purchasing shipping insurance for valuable items.</p>
          </div>
        </section>

        {/* Refund Process */}
        <section>
          <h2>Refund Process</h2>
          <div>
            <p>Once we receive and inspect your return, we will process your refund as follows:</p>
            <ul>
              <li>
                <strong>Inspection Period:</strong> Returns are inspected within 2-3 business days of receipt
              </li>
              <li>
                <strong>Approved Returns:</strong> Refunds are processed within 5-7 business days after approval
              </li>
              <li>
                <strong>Payment Method:</strong> Refunds are issued to the original payment method used for the purchase
              </li>
              <li>
                <strong>Processing Time:</strong> Credit card refunds typically appear within 3-5 business days, while
                bank transfers may take 5-10 business days
              </li>
              <li>
                <strong>Partial Refunds:</strong> Partial refunds may be issued for items returned in less than original
                condition
              </li>
            </ul>
          </div>
        </section>

        {/* Refund Methods */}
        <section>
          <h2>Refund Methods</h2>
          <div>
            <p>Refunds are processed using the same payment method used for the original purchase:</p>
            <ul>
              <li>
                <strong>Credit/Debit Cards:</strong> Refunds are processed back to the original card within 3-5 business
                days
              </li>
              <li>
                <strong>PayPal:</strong> Refunds are processed back to your PayPal account within 1-2 business days
              </li>
              <li>
                <strong>Bank Transfers:</strong> Refunds may take 5-10 business days to appear in your account
              </li>
              <li>
                <strong>Store Credit:</strong> In some cases, refunds may be issued as store credit for future purchases
              </li>
            </ul>
          </div>
        </section>

        {/* Damaged or Defective Items */}
        <section>
          <h2>Damaged or Defective Items</h2>
          <div>
            <p>If you receive a damaged or defective item, please contact us immediately:</p>
            <ul>
              <li>
                <strong>Documentation:</strong> Take photos of the damage or defect for our records
              </li>
              <li>
                <strong>Contact Us:</strong> Email support@zmdeals.shop with your order number and photos within 48
                hours of delivery
              </li>
              <li>
                <strong>Replacement or Refund:</strong> We will offer a replacement, repair, or full refund at your
                choice
              </li>
              <li>
                <strong>Shipping Coverage:</strong> We cover all shipping costs for damaged or defective items
              </li>
            </ul>
          </div>
        </section>

        {/* Exchanges */}
        <section>
          <h2>Exchanges</h2>
          <div>
            <p>We offer exchanges for items in different sizes, colors, or styles, subject to availability:</p>
            <ul>
              <li>
                <strong>Exchange Process:</strong> Follow the same return process and specify your desired exchange item
              </li>
              <li>
                <strong>Price Differences:</strong> If the exchange item costs more, you will be charged the difference.
                If it costs less, you will receive a refund for the difference
              </li>
              <li>
                <strong>Availability:</strong> Exchanges are subject to item availability. If your desired item is not
                available, we will process a refund instead
              </li>
              <li>
                <strong>Shipping:</strong> We cover shipping costs for exchanges of the same value
              </li>
            </ul>
          </div>
        </section>

        {/* Late Returns */}
        <section>
          <h2>Late Returns</h2>
          <div>
            <p>Returns received after the 30-day return period may be considered on a case-by-case basis:</p>
            <ul>
              <li>
                <strong>Extended Returns:</strong> We may accept late returns for valid reasons (extended shipping
                delays, etc.)
              </li>
              <li>
                <strong>Partial Refunds:</strong> Late returns may be subject to restocking fees or partial refunds
              </li>
              <li>
                <strong>Store Credit:</strong> Late returns may be issued as store credit instead of a full refund
              </li>
              <li>
                <strong>Communication:</strong> Please contact us to discuss late return options before shipping
              </li>
            </ul>
          </div>
        </section>

        {/* Restocking Fees */}
        <section>
          <h2>Restocking Fees</h2>
          <div>
            <p>The following restocking fees may apply:</p>
            <ul>
              <li>
                <strong>No Fee:</strong> Returns within 14 days in original condition
              </li>
              <li>
                <strong>10% Fee:</strong> Returns between 15-30 days in original condition
              </li>
              <li>
                <strong>15% Fee:</strong> Returns with minor wear or missing accessories
              </li>
              <li>
                <strong>25% Fee:</strong> Returns with significant wear, damage, or missing packaging
              </li>
              <li>
                <strong>No Refund:</strong> Items returned in unsellable condition
              </li>
            </ul>
          </div>
        </section>

        {/* Third-Party Sellers */}
        <section>
          <h2>Third-Party Seller Returns</h2>
          <div>
            <p>
              Items purchased from third-party sellers through our platform are subject to their individual return
              policies:
            </p>
            <ul>
              <li>
                <strong>Seller Policies:</strong> Each seller sets their own return policy and eligibility criteria
              </li>
              <li>
                <strong>Contact Seller:</strong> Contact the seller directly for return requests and instructions
              </li>
              <li>
                <strong>Platform Support:</strong> We can assist with communication between you and the seller
              </li>
              <li>
                <strong>Dispute Resolution:</strong> We provide dispute resolution services for third-party transactions
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2>Contact Us</h2>
          <div>
            <p>
              If you have questions about our refund and returns policy or need assistance with a return, please contact
              us:
            </p>
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
              Please include your order number and detailed description of the issue when contacting us for faster
              assistance.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
