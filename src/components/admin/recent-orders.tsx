import Link from "next/link";

import { AlertCircle, CheckCircle, Clock, Eye, ShoppingCart, XCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getAllOrders } from "@/modules/orders/actions/query";

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "processing":
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "completed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export async function RecentOrders() {
  const ordersResult = await getAllOrders();

  if (!ordersResult.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">Unable to load orders</div>
        </CardContent>
      </Card>
    );
  }

  const recentOrders = ordersResult.orders?.slice(0, 5) || [];

  return (
    <Card>
      <CardContent className="p-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>

            <Button asChild size="sm" variant="outline">
              <Link href="/studio/orders">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <ShoppingCart className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No orders yet</p>
            <p className="text-sm">Orders will appear here once customers start shopping</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const orderTotal =
                order.items?.reduce((sum, item) => {
                  return sum + Number.parseFloat(item.unitPrice) * item.quantity;
                }, 0) || 0;

              const customerName = order.user?.name || "Guest User";
              const customerInitials = customerName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div className="flex items-center space-x-4 rounded-lg border p-4" key={order.id}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage alt={customerName} src={order.user?.image || ""} />
                    <AvatarFallback>{customerInitials}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm leading-none">{customerName}</p>
                        <p className="text-muted-foreground text-sm">Order #{order.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(orderTotal)}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground text-xs">{order.items?.length || 0} items</span>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/studio/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
