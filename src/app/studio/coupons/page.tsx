import { Suspense } from "react";
import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CouponManagement, getCoupons } from "@/modules/coupons";

export default function CouponsPage() {
  return (
    <main>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
        <div className="flex w-full items-center justify-between">
          <h1 className="font-bold text-2xl">Products</h1>
          <Button asChild size="sm">
            <Link href="/studio/coupons/new">
              <Plus />
              Add Coupon
            </Link>
          </Button>
        </div>

        <Suspense fallback={<div>Loading coupons...</div>}>
          <SuspendedCouponsManagement />
        </Suspense>
      </div>
    </main>
  );
}

export const SuspendedCouponsManagement = async () => {
  const result = await getCoupons();
  return <CouponManagement coupons={result.data} />;
};
