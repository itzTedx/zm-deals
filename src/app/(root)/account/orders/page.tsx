import Link from "next/link";

import { CheckCircle, Clock, Eye, Package, Truck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { getSession } from "@/lib/auth/server";
import { getUserOrders } from "@/modules/orders/actions/query";
import { OrderWithItemsAndProducts } from "@/modules/orders/types";

export default async function OrdersPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">My Orders</h1>
          <p className="mb-6 text-muted-foreground">Please sign in to view your orders.</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const result = await getUserOrders();
  const orders: OrderWithItemsAndProducts[] = result.success ? result.orders || [] : [];

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">My Orders</h1>
          <p className="mb-6 text-muted-foreground">{result.error || "Failed to fetch orders"}</p>
          <Button asChild>
            <Link href="/orders">Try Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "confirmed":
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "cancelled":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  }

  function getStatusColor(status: string) {
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
  }

  function getStatusDescription(status: string) {
    switch (status) {
      case "pending":
        return "Your order is being processed";
      case "confirmed":
        return "Your order has been confirmed";
      case "processing":
        return "Your order is being prepared";
      case "shipped":
        return "Your order is on its way";
      case "delivered":
        return "Your order has been delivered";
      case "cancelled":
        return "Your order has been cancelled";
      case "failed":
        return "Your order failed to process";
      default:
        return "Order status unknown";
    }
  }

  function formatPrice(price: number | string) {
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(numericPrice);
  }

  function formatDateTime(dateString: string | Date) {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-2xl">My Orders</h1>
        <p className="text-muted-foreground">Track your orders and view order history</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No orders yet</h3>
              <p className="mb-6 text-muted-foreground">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card className="transition-shadow hover:shadow-md" key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Order Info */}
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                        <p className="text-muted-foreground text-sm">{formatDateTime(order.createdAt)}</p>
                        <p className="text-muted-foreground text-sm">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Amount */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="max-w-xs text-right text-muted-foreground text-xs">
                      {getStatusDescription(order.status)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mt-4 border-t pt-4">
                  <div className="space-y-2">
                    {order.items?.slice(0, 2).map((item) => (
                      <div className="flex items-center gap-3" key={item.id}>
                        {item.productImage && (
                          <img
                            alt={item.productTitle}
                            className="h-10 w-10 rounded object-cover"
                            src={item.productImage}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">{item.productTitle}</p>
                          <p className="text-muted-foreground text-xs">
                            Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatPrice(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 2 && (
                      <p className="text-muted-foreground text-sm">+{(order.items?.length || 0) - 2} more items</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {orders.length > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <p className="font-bold text-2xl">{orders.length}</p>
                <p className="text-muted-foreground text-sm">Total Orders</p>
              </div>
              <div>
                <p className="font-bold text-2xl">{orders.filter((o) => o.status === "delivered").length}</p>
                <p className="text-muted-foreground text-sm">Delivered</p>
              </div>
              <div>
                <p className="font-bold text-2xl">{orders.filter((o) => o.status === "shipped").length}</p>
                <p className="text-muted-foreground text-sm">In Transit</p>
              </div>
              <div>
                <p className="font-bold text-2xl">
                  {formatPrice(orders.reduce((sum, order) => sum + Number(order.totalAmount), 0))}
                </p>
                <p className="text-muted-foreground text-sm">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
