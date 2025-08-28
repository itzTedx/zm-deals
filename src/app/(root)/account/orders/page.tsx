import Image from "next/image";
import Link from "next/link";

import { CheckCircle, Clock, Eye, Package, Truck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { getSession } from "@/lib/auth/server";
import { formatDate } from "@/lib/functions/format-date";
import { getUserOrders } from "@/modules/orders/actions/query";
import { OrderWithItemsAndProducts } from "@/modules/orders/types";
import { formatPrice, getStatusDescription } from "@/modules/orders/utils";

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
        <Card>
          <CardContent>
            {orders.map((order) => (
              <div className="relative rounded-xl border p-4" key={order.id}>
                <Link className="absolute inset-0" href={`/account/orders/${order.orderNumber}`} />
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Order Info */}
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-medium text-gray-700">
                          <span className="capitalize">{order.status}</span>
                          <span> on {formatDate(order.createdAt, { relative: true, includeTime: true })}</span>
                        </p>
                        <p className="text-muted-foreground text-xs">{getStatusDescription(order.status)}</p>

                        {/* <p className="text-muted-foreground text-sm">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                        </p> */}
                      </div>
                    </div>
                  </div>

                  {/* Status and Amount */}
                  <div className="flex flex-col items-end gap-2">
                    {/* <div className="text-right">
                      <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div> */}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/account/orders/${order.id}`}>
                        <Eye className="mr-2 size-4" />
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
                            className="rounded object-cover"
                            height={100}
                            src={item.productImage}
                            width={100}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-lg">{item.productTitle}</p>
                          <p className="text-gray-500 text-sm">
                            Qty: {item.quantity} x {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 1 && (
                      <p className="text-muted-foreground text-sm">+{(order.items?.length || 0) - 2} more items</p>
                    )}
                    <div className="flex items-center justify-end">
                      <p className="text-right text-gray-500 text-xs">
                        Order ID <span className="font-medium">#{order.orderNumber}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function getStatusIcon(status: string) {
  switch (status) {
    case "confirmed":
    case "delivered":
      return (
        <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
          <CheckCircle className="size-5 text-success" />
        </div>
      );
    case "pending":
    case "processing":
      return <Clock className="size-4 text-warning" />;
    case "shipped":
      return <Truck className="size-4 text-success" />;
    case "cancelled":
    case "failed":
      return <XCircle className="size-4 text-destructive" />;
    default:
      return <Package className="size-4 text-muted-foreground" />;
  }
}
