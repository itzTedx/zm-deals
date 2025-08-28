"use client";

import { useState, useTransition } from "react";

import { X } from "lucide-react";
import { toast } from "sonner";

import { Banner, BannerClose, BannerContent, BannerText, BannerTitle } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconDiscount } from "@/assets/icons";

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
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    if (!session) {
      setError("Please sign in to apply coupons");
      return;
    }

    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
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
          setError(null);
        } else {
          setError(result.error || "Invalid coupon code");
        }
      } catch (error) {
        console.error("Error applying coupon:", error);
        setError("Failed to apply coupon");
      }
    });
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
  };

  return (
    <div className="space-y-2">
      {appliedCoupon ? (
        <div className="flex items-center justify-between rounded-md border bg-card p-3">
          <div className="flex items-center gap-2 text-success">
            <IconDiscount className="size-5" strokeWidth={2} />
            <div className="inline-flex items-center gap-1">
              <p className="font-semibold text-sm">{appliedCoupon.code}</p>
              <p className="font-medium text-muted-foreground text-xs">
                {appliedCoupon.discountType === "percentage"
                  ? `${appliedCoupon.discountValue}% off`
                  : `$${appliedCoupon.discountValue} off`}
              </p>
            </div>
          </div>
          <Button onClick={handleRemoveCoupon} size="btn" variant="destructive">
            <X />
          </Button>
        </div>
      ) : (
        <div className="flex">
          <div className="relative flex-1">
            <Input
              className="flex-1 rounded-r-none bg-card sm:rounded-r-none"
              disabled={isPending}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplyCoupon();
                }
              }}
              placeholder="Enter coupon"
              value={couponCode}
            />
            {couponCode && (
              <Button
                className="-translate-y-1/2 absolute top-1/2 right-2"
                onClick={() => setCouponCode("")}
                size="btn"
                variant="ghost"
              >
                <X />
              </Button>
            )}
          </div>
          <Button
            className="rounded-l-none border-brand-300 border-l-0 bg-gradient-to-b from-brand-500 to-brand-700 sm:rounded-l-none"
            disabled={isPending}
            onClick={handleApplyCoupon}
            type="submit"
          >
            <LoadingSwap isLoading={isPending}>Apply</LoadingSwap>
          </Button>
        </div>
      )}

      {error && (
        <Banner className="bg-card" size="sm">
          <BannerContent className="flex items-center justify-between text-destructive">
            <BannerText>
              <BannerTitle className="font-medium text-sm">{error}</BannerTitle>
            </BannerText>
            <BannerClose className="!static" onClick={() => setError(null)} />
          </BannerContent>
        </Banner>
      )}
    </div>
  );
}
