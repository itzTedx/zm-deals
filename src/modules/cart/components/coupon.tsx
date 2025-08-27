"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSession } from "@/lib/auth/client";

import { validateCoupon } from "../../coupons/actions/query";
import type { CouponValidationResult } from "../../coupons/types";

interface CouponProps {
  appliedCoupon?: CouponValidationResult["coupon"];
  cartTotal: number;
  onCouponApplied: (result: CouponValidationResult) => void;
  onCouponRemoved: () => void;
}

export function Coupon({ appliedCoupon, cartTotal, onCouponApplied, onCouponRemoved }: CouponProps) {
  const { data: session } = useSession();
  const [couponCode, setCouponCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApplyCoupon = () => {
    if (!session) {
      toast.error("Please sign in to apply coupons");
      return;
    }

    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    startTransition(async () => {
      try {
        const result = await validateCoupon({
          code: couponCode.trim(),
          cartTotal,
        });
        onCouponApplied(result);

        if (result.isValid) {
          toast.success("Coupon applied successfully!");
          setCouponCode("");
        } else {
          toast.error(result.error || "Invalid coupon code");
        }
      } catch (error) {
        console.error("Error applying coupon:", error);
        toast.error("Failed to apply coupon");
      }
    });
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast.success("Coupon removed");
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Have a coupon?</h4>

      {appliedCoupon ? (
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="font-medium text-sm">{appliedCoupon.code}</p>
            <p className="text-muted-foreground text-xs">
              {appliedCoupon.discountType === "percentage"
                ? `${appliedCoupon.discountValue}% off`
                : `$${appliedCoupon.discountValue} off`}
            </p>
          </div>
          <Button
            className="text-destructive hover:text-destructive"
            onClick={handleRemoveCoupon}
            size="sm"
            variant="ghost"
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            className="flex-1"
            disabled={isPending}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApplyCoupon();
              }
            }}
            placeholder="Enter coupon code"
            value={couponCode}
          />
          <Button disabled={isPending || !couponCode.trim()} onClick={handleApplyCoupon} size="sm">
            {isPending ? "Applying..." : "Apply"}
          </Button>
        </div>
      )}
    </div>
  );
}
