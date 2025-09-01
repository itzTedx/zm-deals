import Image from "next/image";
import Link from "next/link";

import { CheckCircle, Clock, CreditCard, Package, Truck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDate } from "@/lib/functions/format-date";
import { getOrderBySessionId } from "@/modules/orders/actions/query";
import { OrderWithItemsAndProducts } from "@/modules/orders/types";

interface CheckoutStatus {
  status: "success" | "cancelled" | "pending" | "error";
  message: string;
  sessionId?: string;
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CheckoutStatusPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const success = params.success;
  const cancelled = params.cancelled;
  const sessionId = params.session_id;
  const error = params.error;

  let checkoutStatus: CheckoutStatus | null = null;
  let orderDetails: OrderWithItemsAndProducts | null = null;

  if (success === "1" && sessionId) {
    checkoutStatus = {
      status: "success",
      message: "Thank you for your order!",
      sessionId: sessionId as string,
    };

    // Fetch order details
    try {
      const result = await getOrderBySessionId(sessionId as string);
      if (result.success && result.order) {
        orderDetails = result.order as OrderWithItemsAndProducts;
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  } else if (cancelled === "1") {
    checkoutStatus = {
      status: "cancelled",
      message: "Payment was cancelled. Please try again.",
    };
  } else if (error) {
    checkoutStatus = {
      status: "error",
      message: "An error occurred during payment. Please try again.",
    };
  } else {
    checkoutStatus = {
      status: "pending",
      message: "Processing your payment. Please wait...",
    };
  }

  if (!checkoutStatus) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Checkout</h1>
          <p className="text-muted-foreground">No checkout session found.</p>
          <Button asChild className="mt-4">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (checkoutStatus!.status) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "pending":
        return <Clock className="h-16 w-16 text-yellow-500" />;
      default:
        return <Package className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (checkoutStatus!.status) {
      case "success":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      case "error":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-muted-foreground";
    }
  };

  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(numericPrice);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">{getStatusIcon()}</div>
            <CardTitle className={`text-2xl ${getStatusColor()}`}>
              {checkoutStatus.status === "success" && "Payment Successful!"}
              {checkoutStatus.status === "cancelled" && "Payment Cancelled"}
              {checkoutStatus.status === "error" && "Payment Error"}
              {checkoutStatus.status === "pending" && "Payment Pending"}
            </CardTitle>
            <CardDescription className="text-lg">{checkoutStatus.message}</CardDescription>
          </CardHeader>
        </Card>

        {/* Order Details */}
        {orderDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
              <CardDescription>
                Order #{orderDetails.orderNumber} • {formatDate(orderDetails.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Order Status</p>
                  <Badge variant={orderDetails.status === "confirmed" ? "default" : "secondary"}>
                    {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-medium text-sm">Payment Status</p>
                  <Badge variant={orderDetails.paymentStatus === "paid" ? "default" : "secondary"}>
                    {orderDetails.paymentStatus.charAt(0).toUpperCase() + orderDetails.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-semibold">Items Ordered</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item) => (
                    <div className="flex items-center gap-4 rounded-lg border p-3" key={item.id}>
                      {item.productImage && (
                        <Image
                          alt={item.productTitle}
                          className="h-16 w-16 rounded-md object-cover"
                          height={64}
                          src={item.productImage}
                          width={64}
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productTitle}</h4>
                        <p className="text-muted-foreground text-sm">
                          Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(orderDetails.subtotal)}</span>
                  </div>
                  {Number.parseFloat(orderDetails.taxAmount.toString()) > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(orderDetails.taxAmount)}</span>
                    </div>
                  )}
                  {Number.parseFloat(orderDetails.shippingAmount.toString()) > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatPrice(orderDetails.shippingAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{formatPrice(orderDetails.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {orderDetails.shippingAddress && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Truck className="h-4 w-4" />
                    Shipping Address
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}
                    </p>
                    <p>{orderDetails.shippingAddress.address1}</p>
                    {orderDetails.shippingAddress.address2 && <p>{orderDetails.shippingAddress.address2}</p>}
                    <p>
                      {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}{" "}
                      {orderDetails.shippingAddress.postalCode}
                    </p>
                    <p>{orderDetails.shippingAddress.country}</p>
                    {orderDetails.shippingAddress.phone && <p>Phone: {orderDetails.shippingAddress.phone}</p>}
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <CreditCard className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Email:</strong> {orderDetails.customerEmail}
                  </p>
                  {orderDetails.customerPhone && (
                    <p>
                      <strong>Phone:</strong> {orderDetails.customerPhone}
                    </p>
                  )}
                  <p>
                    <strong>Order Number:</strong> {orderDetails.orderNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/">{checkoutStatus.status === "success" ? "Continue Shopping" : "Back to Store"}</Link>
          </Button>

          {checkoutStatus.status === "success" && (
            <Button asChild className="flex-1" variant="outline">
              <Link href="/account/orders">View All Orders</Link>
            </Button>
          )}

          {checkoutStatus.status === "cancelled" && (
            <Button asChild className="flex-1" variant="outline">
              <Link href="/account/orders">View Cart</Link>
            </Button>
          )}
        </div>

        {/* Additional Information */}
        {checkoutStatus.status === "success" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold text-green-800">What happens next?</h3>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• You will receive an order confirmation email shortly</li>
                <li>• Your order will be processed and shipped within 2-3 business days</li>
                <li>• You can track your order using the tracking number provided</li>
                <li>• For any questions, please contact our customer support</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {checkoutStatus.status === "cancelled" && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold text-yellow-800">No worries!</h3>
              <p className="text-sm text-yellow-700">
                Your cart items are still saved. You can continue shopping or try the payment again.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
