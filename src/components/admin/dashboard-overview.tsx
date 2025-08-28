import { DashboardMetrics } from "./dashboard-metrics";
import { QuickActions } from "./quick-actions";
import { RecentOrders } from "./recent-orders";

export async function AdminDashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <DashboardMetrics />

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <div className="col-span-5">
          <RecentOrders />
        </div>

        {/* Quick Actions & Stats */}
        <div className="col-span-2 space-y-4">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
