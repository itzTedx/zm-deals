import type { Metadata } from "next";

import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Shipping Information",
  description:
    "Learn about ZM Deals' shipping policies, delivery times, and shipping costs. All products are shipped from the UAE to customers worldwide.",
};

export default function ShippingInformationPage() {
  return (
    <div className="prose prose-lg prose-gray container max-w-[80ch] py-8 sm:py-12">
      <div className="space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1>Shipping Information</h1>
          <p className="text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-muted-foreground">
            At ZM Deals, we ship all products directly from our warehouse in the United Arab Emirates (UAE) to customers
            worldwide. This page provides detailed information about our shipping policies, delivery times, costs, and
            what to expect when your order is shipped.
          </p>
        </header>

        <Separator />

        {/* Shipping Location */}
        <section>
          <h2>Shipping from the UAE</h2>
          <div>
            <p>
              <strong>
                All ZM Deals products are shipped directly from our warehouse in the United Arab Emirates.
              </strong>
              This centralized shipping location allows us to:
            </p>
            <ul>
              <li>Ensure consistent quality control and packaging standards</li>
              <li>Provide faster processing times for international orders</li>
              <li>Maintain better inventory management and stock accuracy</li>
              <li>Offer competitive shipping rates through established logistics partnerships</li>
              <li>Comply with UAE export regulations and international shipping standards</li>
            </ul>
            <p>
              Our UAE-based operations enable us to serve customers across the Middle East, Europe, Asia, and beyond
              with reliable and efficient shipping services.
            </p>
          </div>
        </section>

        {/* Shipping Methods */}
        <section>
          <h2>Available Shipping Methods</h2>
          <div>
            <p>We offer several shipping options to meet your delivery needs:</p>
            <ul>
              <li>
                <strong>Standard Shipping (5-10 business days):</strong> Our most economical option, perfect for
                non-urgent orders
              </li>
            </ul>
          </div>
        </section>

        {/* Processing Times */}
        <section>
          <h2>Order Processing Times</h2>
          <div>
            <p>Once your order is placed, here's what happens:</p>
            <ul>
              <li>
                <strong>Order Confirmation:</strong> Immediate email confirmation with order details
              </li>
              <li>
                <strong>Payment Processing:</strong> 1-2 business days for payment verification
              </li>
              <li>
                <strong>Order Preparation:</strong> 1-2 business days for picking, packing, and quality checks
              </li>
              <li>
                <strong>Shipping Label Creation:</strong> Same day as order preparation
              </li>
              <li>
                <strong>Handover to Courier:</strong> Next business day after preparation
              </li>
            </ul>
            <p>
              <strong>Total processing time: 2-4 business days before your order leaves our UAE warehouse.</strong>
            </p>
          </div>
        </section>

        {/* Delivery Times */}
        <section>
          <h2>Estimated Delivery Times</h2>
          <div>
            <p>Delivery times from our UAE warehouse to your location:</p>
            <ul>
              <li>
                <strong>UAE Domestic:</strong> 1-2 business days
              </li>
              <li>
                <strong>GCC Countries:</strong> 3-7 business days
              </li>
              <li>
                <strong>Middle East & North Africa:</strong> 5-10 business days
              </li>
              <li>
                <strong>Europe:</strong> 7-14 business days (standard), 3-7 business days (express)
              </li>
              <li>
                <strong>Asia Pacific:</strong> 7-12 business days (standard), 3-5 business days (express)
              </li>
              <li>
                <strong>Americas:</strong> 10-18 business days (standard), 5-8 business days (express)
              </li>
              <li>
                <strong>Rest of World:</strong> 12-20 business days (standard), 7-10 business days (express)
              </li>
            </ul>
            <p>
              <em>
                Note: Delivery times may be extended during peak seasons, holidays, or due to customs processing in your
                country.
              </em>
            </p>
          </div>
        </section>

        {/* Tracking Information */}
        <section>
          <h2>Order Tracking</h2>
          <div>
            <p>Track your order from our UAE warehouse to your doorstep:</p>
            <ul>
              <li>
                <strong>Tracking Number:</strong> Provided via email once your order ships from the UAE
              </li>
              <li>
                <strong>Real-time Updates:</strong> Track your package through our website or courier's tracking portal
              </li>
              <li>
                <strong>Email Notifications:</strong> Receive updates at key delivery milestones
              </li>
              <li>
                <strong>Delivery Confirmation:</strong> Email notification when your package is delivered
              </li>
              <li>
                <strong>Customer Support:</strong> Contact us for assistance with tracking issues
              </li>
            </ul>
          </div>
        </section>

        {/* Customs and Duties */}
        <section>
          <h2>Customs and Import Duties</h2>
          <div>
            <p>Since all products are shipped from the UAE, international customers should be aware of:</p>
            <ul>
              <li>
                <strong>Import Duties:</strong> May apply depending on your country's customs regulations
              </li>
              <li>
                <strong>Taxes:</strong> Local taxes (VAT, GST, etc.) may be charged upon delivery
              </li>
              <li>
                <strong>Customs Processing:</strong> May add 1-5 business days to delivery time
              </li>
              <li>
                <strong>Documentation:</strong> We provide all necessary customs documentation
              </li>
              <li>
                <strong>Payment:</strong> Duties and taxes are typically paid to the courier upon delivery
              </li>
            </ul>
            <p>
              <em>
                ZM Deals is not responsible for customs duties, taxes, or fees charged by your local government. These
                costs are the responsibility of the recipient.
              </em>
            </p>
          </div>
        </section>

        {/* Packaging */}
        <section>
          <h2>Packaging and Protection</h2>
          <div>
            <p>All orders shipped from our UAE warehouse include:</p>
            <ul>
              <li>
                <strong>Secure Packaging:</strong> High-quality materials to protect your items during transit
              </li>
              <li>
                <strong>Bubble Wrap:</strong> Additional protection for fragile items
              </li>
              <li>
                <strong>Waterproofing:</strong> Protection against moisture and weather conditions
              </li>
              <li>
                <strong>Proper Labeling:</strong> Clear shipping labels and customs documentation
              </li>
              <li>
                <strong>Insurance:</strong> Basic insurance coverage for lost or damaged items
              </li>
            </ul>
            <p>
              We take extra care to ensure your products arrive in perfect condition, regardless of the distance from
              our UAE warehouse to your location.
            </p>
          </div>
        </section>

        {/* Shipping Restrictions */}
        <section>
          <h2>Shipping Restrictions</h2>
          <div>
            <p>Some items may have shipping restrictions from the UAE:</p>
            <ul>
              <li>
                <strong>Prohibited Items:</strong> Certain electronics, batteries, and restricted goods
              </li>
              <li>
                <strong>Size Limitations:</strong> Very large or heavy items may require special handling
              </li>
              <li>
                <strong>Country Restrictions:</strong> Some countries have import restrictions on certain products
              </li>
              <li>
                <strong>Battery Shipping:</strong> Lithium batteries have special shipping requirements
              </li>
              <li>
                <strong>Fragile Items:</strong> May require additional packaging and handling fees
              </li>
            </ul>
            <p>
              If you have questions about shipping restrictions for specific items, please contact our customer support
              team.
            </p>
          </div>
        </section>

        {/* Lost or Damaged Packages */}
        <section>
          <h2>Lost or Damaged Packages</h2>
          <div>
            <p>If your package is lost or damaged during shipping from the UAE:</p>
            <ul>
              <li>
                <strong>Report Immediately:</strong> Contact us within 48 hours of expected delivery
              </li>
              <li>
                <strong>Documentation:</strong> Provide photos and tracking information
              </li>
              <li>
                <strong>Investigation:</strong> We will work with the courier to investigate the issue
              </li>
              <li>
                <strong>Replacement/Refund:</strong> We will replace or refund lost/damaged items
              </li>
              <li>
                <strong>Insurance Claims:</strong> We handle insurance claims on your behalf
              </li>
            </ul>
            <p>
              Our customer support team is available to assist with any shipping issues, regardless of your location
              relative to our UAE warehouse.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2>Shipping Support</h2>
          <div>
            <p>For questions about shipping from our UAE warehouse or assistance with your order, please contact us:</p>
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
              Please include your order number and specific shipping question when contacting us for faster assistance.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
