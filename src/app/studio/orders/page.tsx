import { Suspense } from "react";

import { isAdmin } from "@/lib/auth/permissions";
import { OrdersDataTable } from "@/modules/orders/components/table/data-table";

export default async function OrdersPage() {
  await isAdmin();

  return (
    <main>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl">Orders</h1>
        </div>
        <Suspense fallback={<div>Loading orders...</div>}>
          <OrdersDataTable />
        </Suspense>
      </div>
    </main>
  );
}
