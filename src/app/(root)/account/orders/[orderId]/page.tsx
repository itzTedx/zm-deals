import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, CheckCircle, Clock, CreditCard, Package, Truck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getSession } from "@/lib/auth/server";
import { formatDate } from "@/lib/functions/format-date";
import { getOrderById } from "@/modules/orders/actions/query";

type Params = Promise<{ orderId: string }>;

interface OrderDetailPageProps {
  params: Params;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getSession();
  const { orderId } = await params;

  if (!session) {
    redirect("/login");
  }

  const result = await getOrderById(orderId);

  if (!result.success || !result.order) {
    return (
      <div className="text-center">
        <h1 className="mb-4 font-bold text-2xl">Order Details</h1>
        <p className="mb-6 text-muted-foreground">{result.error || "Order not found"}</p>
        <Button asChild>
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const order = result.order;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "cancelled":
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="pb-2">
      <div className="mb-6">
        <Button asChild className="mb-4" variant="ghost">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="font-medium text-2xl">Order #{order.orderNumber}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Status */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Order Status</p>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-medium text-sm">Payment Status</p>
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="px-1.5 pt-1.5">
              <CardTitle className="font-medium text-gray-500 text-sm">Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div className="flex items-center gap-4 rounded-lg border p-4" key={item.id}>
                    {item.product.image && (
                      <Image
                        alt={item.product.title}
                        className="h-16 w-16 rounded-md object-cover"
                        height={64}
                        src={item.product.image}
                        width={64}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.title}</h4>
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
            </CardContent>
          </Card>

          {/* Order History */}
          {order.history && order.history.length > 0 && (
            <Card>
              <CardHeader className="px-1.5 pt-1.5">
                <CardTitle className="font-medium text-gray-500 text-sm">Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.history.map((history) => (
                    <div className="flex items-start gap-3" key={history.id}>
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{history.changeReason || "Status updated"}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(history.createdAt, {
                            includeTime: true,
                          })}
                        </p>
                        {history.changeNote && (
                          <p className="mt-1 text-muted-foreground text-xs">{history.changeNote}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="px-1.5 pt-1.5">
              <CardTitle className="font-medium text-gray-500 text-sm">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {Number(order.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                {Number(order.shippingAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader className="px-1.5 pt-1.5">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong> {order.customerEmail}
                </p>
                {order.customerPhone && (
                  <p>
                    <strong>Phone:</strong> {order.customerPhone}
                  </p>
                )}
                <p>
                  <strong>Order Date:</strong> {formatDate(order.createdAt)}
                </p>
                {order.confirmedAt && (
                  <p>
                    <strong>Confirmed:</strong> {formatDate(order.confirmedAt)}
                  </p>
                )}
                {order.shippedAt && (
                  <p>
                    <strong>Shipped:</strong> {formatDate(order.shippedAt)}
                  </p>
                )}
                {order.deliveredAt && (
                  <p>
                    <strong>Delivered:</strong> {formatDate(order.deliveredAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Note */}
          {order.customerNote && (
            <Card>
              <CardHeader>
                <CardTitle className="font-medium text-gray-500 text-sm">Order Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.customerNote}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
