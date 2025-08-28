import Image from "next/image";
import Link from "next/link";

import { CheckCircle, Clock, Eye, Package, Truck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { getSession } from "@/lib/auth/server";
import { getUserOrders } from "@/modules/orders/actions/query";
import { OrderWithItemsAndProducts } from "@/modules/orders/types";
import { formatDateTime, formatPrice, getStatusColor, getStatusDescription } from "@/modules/orders/utils";

export default async function OrdersPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="container mx-auto py-8">
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
      <div className="container mx-auto py-8">
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-2xl">Orders</h1>
        <p className="text-muted-foreground text-sm">Track your orders and view order history</p>
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
                      <Link href={`/account/orders/${order.id}`}>
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
                          <Image
                            alt={item.productTitle}
                            className="h-10 w-10 rounded object-cover"
                            height={64}
                            src={item.productImage}
                            width={64}
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
    </div>
  );
}

export function getStatusIcon(status: string) {
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
