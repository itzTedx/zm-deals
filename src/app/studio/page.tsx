import { Suspense } from "react";

import { AdminDashboardOverview } from "@/components/admin/dashboard-overview";

import { isAdmin } from "@/lib/auth/permissions";

export default async function StudioPage() {
  await isAdmin();

  return (
    <main className="container flex-1 space-y-4 py-4 md:py-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-sm">Welcome back, Admin</span>
        </div>
      </div>
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardOverview />
      </Suspense>
    </main>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="h-32 animate-pulse rounded-lg border bg-card p-6" key={i}>
            <div className="mb-2 h-4 w-1/2 rounded bg-muted" />
            <div className="h-8 w-1/3 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 h-96 animate-pulse rounded-lg border bg-card p-6">
          <div className="mb-4 h-4 w-1/3 rounded bg-muted" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="h-4 rounded bg-muted" key={i} />
            ))}
          </div>
        </div>
        <div className="col-span-3 h-96 animate-pulse rounded-lg border bg-card p-6">
          <div className="mb-4 h-4 w-1/2 rounded bg-muted" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="h-4 rounded bg-muted" key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
