import { Suspense } from "react";

import { AdminNavbar } from "@/components/layout/admin-navbar";

import { isAdmin } from "@/lib/auth/permissions";
import { OrdersDataTable } from "@/modules/orders/components/table/data-table";

export default async function OrdersPage() {
  await isAdmin();

  return (
    <div className="space-y-4">
      <AdminNavbar>
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-2xl">Orders</h1>
        </div>
      </AdminNavbar>
      <main>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersDataTable />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
