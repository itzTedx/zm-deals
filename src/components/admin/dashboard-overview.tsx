import { DashboardMetrics } from "./dashboard-metrics";
import { QuickActions } from "./quick-actions";
import { RecentOrders } from "./recent-orders";

export async function AdminDashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-2 md:grid-cols-3">
        {/* Key Metrics */}
        <div className="md:col-span-2">
          <DashboardMetrics />
        </div>
        {/* Quick Actions  */}
        <QuickActions />
      </div>

      <RecentOrders />
    </div>
  );
}
