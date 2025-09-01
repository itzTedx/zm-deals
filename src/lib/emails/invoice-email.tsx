import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

// Types based on the database schema
interface OrderItem {
  id: string;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  unitPrice: string;
  quantity: number;
  totalPrice: string;
}

interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface InvoiceEmailProps {
  // Order details
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  estimatedDelivery?: string;

  // Customer details
  customerName: string;
  customerEmail: string;

  // Items
  items: OrderItem[];

  // Pricing
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  discountAmount: string;
  totalAmount: string;

  // Addresses
  shippingAddress: Address;
  billingAddress?: Address;

  // Additional info
  trackingNumber?: string;
  trackingUrl?: string;
  customerNote?: string;
}

const InvoiceEmail = (props: InvoiceEmailProps) => {
  const formatCurrency = (amount: string) => {
    return `$${Number.parseFloat(amount).toFixed(2)}`;
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.firstName && address.lastName ? `${address.firstName} ${address.lastName}` : undefined,
      address.company,
      address.address1,
      address.address2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
      address.phone,
    ].filter(Boolean);

    return parts.join("\n");
  };

  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Body className="py-[40px] font-sans" style={{ backgroundColor: "#F7F7F7" }}>
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-sm">
            {/* Header with Logo */}
            <Section className="px-[32px] pt-[32px]">
              <Img
                alt="ZM Deals"
                className="h-auto w-full max-w-[200px]"
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/453a191a-fef2-4ba6-88fe-b9e7a16650cd/primary/de920281-4591-498f-9d96-c099e526c3cc.png"
              />
            </Section>

            {/* Order Confirmation Header */}
            <Section className="px-[32px] pt-[24px]">
              <Text className="mb-[8px] font-bold text-[24px]" style={{ color: "#2E2E2E" }}>
                Thank you for your order! 🎉
              </Text>
              <Text className="mb-[16px] text-[16px]" style={{ color: "#2E2E2E" }}>
                Hi {props.customerName}, we're excited to let you know that your order has been confirmed and is being
                prepared for shipment.
              </Text>
            </Section>

            {/* Order Summary */}
            <Section
              className="mx-[32px] rounded-[8px] border-[1px] border-solid px-[32px] py-[24px]"
              style={{ borderColor: "#E5E5E5", backgroundColor: "#F9F9F9" }}
            >
              <Row>
                <Column>
                  <Text className="mb-[12px] font-bold text-[18px]" style={{ color: "#2E2E2E" }}>
                    Order Summary
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column className="w-1/2">
                  <Text className="mb-[4px] text-[14px]" style={{ color: "#666" }}>
                    Order Number:
                  </Text>
                  <Text className="mb-[12px] font-semibold text-[16px]" style={{ color: "#2E2E2E" }}>
                    #{props.orderNumber}
                  </Text>
                </Column>
                <Column className="w-1/2">
                  <Text className="mb-[4px] text-[14px]" style={{ color: "#666" }}>
                    Order Date:
                  </Text>
                  <Text className="mb-[12px] font-semibold text-[16px]" style={{ color: "#2E2E2E" }}>
                    {props.orderDate}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column className="w-1/2">
                  <Text className="mb-[4px] text-[14px]" style={{ color: "#666" }}>
                    Payment Method:
                  </Text>
                  <Text className="font-semibold text-[16px]" style={{ color: "#2E2E2E" }}>
                    {props.paymentMethod}
                  </Text>
                </Column>
                <Column className="w-1/2">
                  <Text className="mb-[4px] text-[14px]" style={{ color: "#666" }}>
                    Status:
                  </Text>
                  <Text className="font-semibold text-[16px]" style={{ color: "#2E2E2E" }}>
                    {props.orderStatus}
                  </Text>
                </Column>
              </Row>
              {props.estimatedDelivery && (
                <Row>
                  <Column className="w-1/2">
                    <Text className="mb-[4px] text-[14px]" style={{ color: "#666" }}>
                      Estimated Delivery:
                    </Text>
                    <Text className="font-semibold text-[16px]" style={{ color: "#2E2E2E" }}>
                      {props.estimatedDelivery}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Invoice Details */}
            <Section className="px-[32px] pt-[24px]">
              <Text className="mb-[16px] font-bold text-[18px]" style={{ color: "#2E2E2E" }}>
                Invoice Details
              </Text>

              {/* Items Header */}
              <Row className="mb-[12px] border-b-[1px] border-b-solid pb-[8px]" style={{ borderColor: "#E5E5E5" }}>
                <Column className="w-1/2">
                  <Text className="font-semibold text-[14px]" style={{ color: "#666" }}>
                    Item
                  </Text>
                </Column>
                <Column className="w-1/6 text-center">
                  <Text className="font-semibold text-[14px]" style={{ color: "#666" }}>
                    Qty
                  </Text>
                </Column>
                <Column className="w-1/6 text-center">
                  <Text className="font-semibold text-[14px]" style={{ color: "#666" }}>
                    Price
                  </Text>
                </Column>
                <Column className="w-1/6 text-right">
                  <Text className="font-semibold text-[14px]" style={{ color: "#666" }}>
                    Total
                  </Text>
                </Column>
              </Row>

              {/* Dynamic Items */}
              {props.items.map((item) => (
                <Row className="mb-[12px]" key={item.id}>
                  <Column className="w-1/2">
                    <Text className="mb-[4px] text-[14px]" style={{ color: "#2E2E2E" }}>
                      {item.productTitle}
                    </Text>
                    {item.productSlug && (
                      <Text className="text-[12px]" style={{ color: "#666" }}>
                        SKU: {item.productSlug}
                      </Text>
                    )}
                  </Column>
                  <Column className="w-1/6 text-center">
                    <Text className="text-[14px]" style={{ color: "#2E2E2E" }}>
                      {item.quantity}
                    </Text>
                  </Column>
                  <Column className="w-1/6 text-center">
                    <Text className="text-[14px]" style={{ color: "#2E2E2E" }}>
                      {formatCurrency(item.unitPrice)}
                    </Text>
                  </Column>
                  <Column className="w-1/6 text-right">
                    <Text className="font-semibold text-[14px]" style={{ color: "#2E2E2E" }}>
                      {formatCurrency(item.totalPrice)}
                    </Text>
                  </Column>
                </Row>
              ))}

              <Hr style={{ borderColor: "#E5E5E5" }} />

              {/* Totals */}
              <Row className="mb-[8px]">
                <Column className="w-2/3" />
                <Column className="w-1/6">
                  <Text className="text-[14px]" style={{ color: "#666" }}>
                    Subtotal:
                  </Text>
                </Column>
                <Column className="w-1/6 text-right">
                  <Text className="text-[14px]" style={{ color: "#2E2E2E" }}>
                    {formatCurrency(props.subtotal)}
                  </Text>
                </Column>
              </Row>

              {Number.parseFloat(props.shippingAmount) > 0 && (
                <Row className="mb-[8px]">
                  <Column className="w-2/3" />
                  <Column className="w-1/6">
                    <Text className="text-[14px]" style={{ color: "#666" }}>
                      Shipping:
                    </Text>
                  </Column>
                  <Column className="w-1/6 text-right">
                    <Text className="text-[14px]" style={{ color: "#2E2E2E" }}>
                      {formatCurrency(props.shippingAmount)}
                    </Text>
                  </Column>
                </Row>
              )}

              {Number.parseFloat(props.taxAmount) > 0 && (
                <Row className="mb-[8px]">
                  <Column className="w-2/3" />
                  <Column className="w-1/6">
                    <Text className="text-[14px]" style={{ color: "#666" }}>
                      Tax:
                    </Text>
                  </Column>
                  <Column className="w-1/6 text-right">
                    <Text className="text-[14px]" style={{ color: "#2E2E2E" }}>
                      {formatCurrency(props.taxAmount)}
                    </Text>
                  </Column>
                </Row>
              )}

              {Number.parseFloat(props.discountAmount) > 0 && (
                <Row className="mb-[8px]">
                  <Column className="w-2/3" />
                  <Column className="w-1/6">
                    <Text className="text-[14px]" style={{ color: "#666" }}>
                      Discount:
                    </Text>
                  </Column>
                  <Column className="w-1/6 text-right">
                    <Text className="text-[14px]" style={{ color: "#2E2E2E" }}>
                      -{formatCurrency(props.discountAmount)}
                    </Text>
                  </Column>
                </Row>
              )}

              <Hr style={{ borderColor: "#E5E5E5" }} />

              <Row className="mb-[16px]">
                <Column className="w-2/3" />
                <Column className="w-1/6">
                  <Text className="font-bold text-[16px]" style={{ color: "#2E2E2E" }}>
                    Total:
                  </Text>
                </Column>
                <Column className="w-1/6 text-right">
                  <Text className="font-bold text-[16px]" style={{ color: "#D02533" }}>
                    {formatCurrency(props.totalAmount)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping Address */}
            <Section className="px-[32px] py-[24px]">
              <Text className="mb-[12px] font-bold text-[18px]" style={{ color: "#2E2E2E" }}>
                Shipping Address
              </Text>
              <Text className="mb-[4px] text-[14px]" style={{ color: "#2E2E2E" }}>
                {formatAddress(props.shippingAddress)}
              </Text>
            </Section>

            {/* Billing Address (if different from shipping) */}
            {props.billingAddress && props.billingAddress !== props.shippingAddress && (
              <Section className="px-[32px] py-[24px]">
                <Text className="mb-[12px] font-bold text-[18px]" style={{ color: "#2E2E2E" }}>
                  Billing Address
                </Text>
                <Text className="mb-[4px] text-[14px]" style={{ color: "#2E2E2E" }}>
                  {formatAddress(props.billingAddress)}
                </Text>
              </Section>
            )}

            {/* Tracking Information */}
            {props.trackingNumber && (
              <Section className="px-[32px] py-[24px]">
                <Text className="mb-[12px] font-bold text-[18px]" style={{ color: "#2E2E2E" }}>
                  Tracking Information
                </Text>
                <Text className="mb-[4px] text-[14px]" style={{ color: "#2E2E2E" }}>
                  Tracking Number: {props.trackingNumber}
                </Text>
                {props.trackingUrl && (
                  <Text className="text-[14px]">
                    <a href={props.trackingUrl} style={{ color: "#D02533" }}>
                      Track Package
                    </a>
                  </Text>
                )}
              </Section>
            )}

            {/* Customer Note */}
            {props.customerNote && (
              <Section className="px-[32px] py-[24px]">
                <Text className="mb-[12px] font-bold text-[18px]" style={{ color: "#2E2E2E" }}>
                  Order Notes
                </Text>
                <Text className="text-[14px]" style={{ color: "#666" }}>
                  {props.customerNote}
                </Text>
              </Section>
            )}

            {/* Action Button */}
            <Section className="px-[32px] pb-[32px] text-center">
              <Button
                className="box-border rounded-[8px] px-[24px] py-[12px] font-semibold text-[16px] text-white no-underline"
                href="https://zmdeals.shop/orders"
                style={{ backgroundColor: "#D02533" }}
              >
                Track Your Order
              </Button>
              <Text className="mt-[16px] mb-[0px] text-[14px]" style={{ color: "#666" }}>
                Need help? Contact our support team at support@zmdeals.shop
              </Text>
            </Section>

            {/* Footer */}
            <Section
              className="border-t-[1px] border-t-solid px-[32px] pt-[24px] pb-[32px]"
              style={{ borderColor: "#E5E5E5" }}
            >
              <Text className="m-0 mb-[8px] text-[12px]" style={{ color: "#666" }}>
                ZM Deals - Your trusted e-commerce partner
              </Text>
              <Text className="m-0 mb-[8px] text-[12px]" style={{ color: "#666" }}>
                Visit us at{" "}
                <a href="https://zmdeals.shop" style={{ color: "#D02533" }}>
                  zmdeals.shop
                </a>
              </Text>
              <Text className="m-0 mb-[12px] text-[12px]" style={{ color: "#666" }}>
                © 2025 ZM Deals. All rights reserved.
              </Text>
              <Text className="m-0 text-[10px]" style={{ color: "#999" }}>
                This email may contain confidential or promotional content for the intended recipient. Product info may
                change without notice. By reading, you agree to ZM Deals' Terms and Policies. If received in error,
                please delete and inform us.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Preview props for development/testing
InvoiceEmail.PreviewProps = {
  orderNumber: "ZM240001",
  orderDate: "January 15, 2025",
  orderStatus: "confirmed",
  paymentStatus: "paid",
  paymentMethod: "Credit Card (**** 4242)",
  estimatedDelivery: "January 18-20, 2025",
  customerName: "Sarah Johnson",
  customerEmail: "sarah.johnson@example.com",
  items: [
    {
      id: "1",
      productTitle: "Wireless Bluetooth Headphones",
      productSlug: "wireless-bluetooth-headphones",
      productImage: "https://example.com/headphones.jpg",
      unitPrice: "129.99",
      quantity: 1,
      totalPrice: "129.99",
    },
    {
      id: "2",
      productTitle: "Smartphone Case",
      productSlug: "smartphone-case-black",
      productImage: "https://example.com/case.jpg",
      unitPrice: "24.99",
      quantity: 2,
      totalPrice: "49.98",
    },
  ],
  subtotal: "179.97",
  taxAmount: "15.20",
  shippingAmount: "9.99",
  discountAmount: "0.00",
  totalAmount: "205.16",
  shippingAddress: {
    firstName: "Sarah",
    lastName: "Johnson",
    address1: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "United States",
  },
  billingAddress: {
    firstName: "Sarah",
    lastName: "Johnson",
    address1: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "United States",
  },
  trackingNumber: "1Z999AA1234567890",
  trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA1234567890",
  customerNote: "Please deliver to the front desk if I'm not home.",
};

export default InvoiceEmail;
