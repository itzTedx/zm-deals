import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { IconCurrency, IconProduct, IconShoppingBag2, IconUser } from "@/assets/icons";

import { cn } from "@/lib/utils";
import { getAllOrders } from "@/modules/orders/actions/query";
import { getProducts } from "@/modules/product/actions/query";
import { getAllUsers } from "@/modules/users/actions/query";

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subtitle: string;
  trend: React.ReactNode;
  className?: string;
}

function MetricCard({ icon, value, label, subtitle, trend, className }: MetricCardProps) {
  return (
    <Card className="md:p-0.5">
      <CardContent className={cn("flex h-full flex-col justify-between p-4 text-background", className)}>
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-full bg-card shadow-lg">{icon}</div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-medium text-2xl">
              {value.toLocaleString()} {label}
            </p>
            <h2 className="text-sm">{subtitle}</h2>
          </div>
          <div className="font-medium text-sm">{trend}</div>
        </div>
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
    <div className="grid gap-2 md:grid-cols-2">
      <MetricCard
        className="bg-brand-500"
        icon={<IconUser className="size-4 text-muted-foreground" />}
        label="Users"
        subtitle={`${recentUsers} new this week`}
        trend={`+${recentUsers > 0 ? Math.round((recentUsers / totalUsers) * 100) : 0}%`}
        value={totalUsers}
      />

      <MetricCard
        className="bg-gray-800"
        icon={<IconShoppingBag2 className="size-4 text-muted-foreground" />}
        label="Orders"
        subtitle={`${recentOrders} this week`}
        trend={`+${totalOrders > 0 ? Math.round((recentOrders / totalOrders) * 100) : 0}%`}
        value={totalOrders}
      />

      <MetricCard
        className="bg-gray-800"
        icon={<IconCurrency className="size-4 text-muted-foreground" />}
        label=""
        subtitle={`${totalRevenue} this week`}
        trend={`+${totalRevenue > 0 ? Math.round((recentRevenue / totalRevenue) * 100) : 0}%`}
        value={totalRevenue}
      />

      <MetricCard
        className="bg-gray-800"
        icon={<IconProduct className="size-4 text-muted-foreground" />}
        label=""
        subtitle="Active products in catalog"
        trend={
          <Badge className="text-xs" size="sm" variant="secondary">
            Active
          </Badge>
        }
        value={totalProducts}
      />
    </div>
  );
}
