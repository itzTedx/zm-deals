"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CouponForm } from "@/modules/coupons";

export default function NewCouponPage() {
  return (
    <main>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 py-4">
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="ghost">
            <Link href="/studio/coupons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Coupons
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">Create New Coupon</h1>
            <p className="text-muted-foreground">Set up a new discount coupon for your customers.</p>
          </div>
        </div>

        <CouponForm
          onCancel={() => {
            window.location.href = "/studio/coupons";
          }}
          onSuccess={() => {
            // Redirect back to coupons list
            window.location.href = "/studio/coupons";
          }}
        />
      </div>
    </main>
  );
}
