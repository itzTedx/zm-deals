import { DollarSign, Package, ShoppingCart, TrendingDown, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAllOrders } from "@/modules/orders/actions/query";
import { getProducts } from "@/modules/product/actions/query";
import { getAllUsers } from "@/modules/users/actions/query";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
}

function MetricCard({ title, value, description, icon, trend, badge }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
        {trend && (
          <div className="mt-2 flex items-center space-x-1">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>{trend.value}%</span>
          </div>
        )}
        {badge && (
          <Badge className="mt-2" variant={badge.variant}>
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export async function DashboardMetrics() {
  // Fetch data for metrics
  const [usersResult, ordersResult, productsResult] = await Promise.all([getAllUsers(), getAllOrders(), getProducts()]);

  const totalUsers = usersResult.success ? usersResult.users?.length || 0 : 0;
  const totalOrders = ordersResult.success ? ordersResult.orders?.length || 0 : 0;
  const totalProducts = productsResult?.length || 0;

  // Calculate revenue from orders
  const totalRevenue = ordersResult.success
    ? ordersResult.orders?.reduce((sum, order) => {
        const orderTotal =
          order.items?.reduce((itemSum, item) => {
            return itemSum + Number.parseFloat(item.unitPrice) * item.quantity;
          }, 0) || 0;
        return sum + orderTotal;
      }, 0) || 0
    : 0;

  // Calculate recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUsers = usersResult.success
    ? usersResult.users?.filter((user) => new Date(user.createdAt) > sevenDaysAgo).length || 0
    : 0;

  const recentOrders = ordersResult.success
    ? ordersResult.orders?.filter((order) => new Date(order.createdAt) > sevenDaysAgo).length || 0
    : 0;

  const recentRevenue = ordersResult.success
    ? ordersResult.orders
        ?.filter((order) => new Date(order.createdAt) > sevenDaysAgo)
        .reduce((sum, order) => {
          const orderTotal =
            order.items?.reduce((itemSum, item) => {
              return itemSum + Number.parseFloat(item.unitPrice) * item.quantity;
            }, 0) || 0;
          return sum + orderTotal;
        }, 0) || 0
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        badge={{
          text: "Active",
          variant: "secondary",
        }}
        description={`${recentUsers} new this week`}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        title="Total Users"
        trend={{
          value: totalUsers > 0 ? Math.round((recentUsers / totalUsers) * 100) : 0,
          isPositive: recentUsers > 0,
        }}
        value={totalUsers.toLocaleString()}
      />

      <MetricCard
        badge={{
          text: "Processing",
          variant: "outline",
        }}
        description={`${recentOrders} this week`}
        icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        title="Total Orders"
        trend={{
          value: totalOrders > 0 ? Math.round((recentOrders / totalOrders) * 100) : 0,
          isPositive: recentOrders > 0,
        }}
        value={totalOrders.toLocaleString()}
      />

      <MetricCard
        badge={{
          text: "Growing",
          variant: "default",
        }}
        description={`$${recentRevenue.toLocaleString()} this week`}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        title="Total Revenue"
        trend={{
          value: totalRevenue > 0 ? Math.round((recentRevenue / totalRevenue) * 100) : 0,
          isPositive: recentRevenue > 0,
        }}
        value={`$${totalRevenue.toLocaleString()}`}
      />

      <MetricCard
        badge={{
          text: "Live",
          variant: "secondary",
        }}
        description="Active products in catalog"
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
        title="Total Products"
        value={totalProducts.toLocaleString()}
      />
    </div>
  );
}
