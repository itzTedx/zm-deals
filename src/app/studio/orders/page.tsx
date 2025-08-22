import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  return (
    <main>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl">Orders</h1>
          <Button asChild size="sm">
            <Link href="/studio/orders">Add Order</Link>
          </Button>
        </div>
        <div>Hello</div>
      </div>
    </main>
  );
}
