"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconDiscount } from "@/assets/icons/discount";
import { IconX } from "@/assets/icons/menu";

import { validateCoupon } from "@/modules/coupons/actions/query";
import type { CouponValidationResult } from "@/modules/coupons/types";

const couponValidatorSchema = z.object({
  code: z.string().min(1, "Please enter a coupon code"),
});

type CouponValidatorData = z.infer<typeof couponValidatorSchema>;

interface CouponSectionProps {
  cartTotal: number;
  onCouponApplied: (result: CouponValidationResult) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: CouponValidationResult["coupon"];
}

export function CouponSection({ cartTotal, onCouponApplied, onCouponRemoved, appliedCoupon }: CouponSectionProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CouponValidationResult | null>(null);

  const form = useForm<CouponValidatorData>({
    resolver: zodResolver(couponValidatorSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: CouponValidatorData) => {
    setIsValidating(true);
    try {
      const result = await validateCoupon({
        code: data.code,
        cartTotal,
      });

      setValidationResult(result);

      if (result.isValid) {
        onCouponApplied(result);
        form.reset();
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setValidationResult({
        isValid: false,
        discountAmount: 0,
        finalPrice: cartTotal,
        error: "Failed to validate coupon",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setValidationResult(null);
  };

  const formatDiscount = (coupon: CouponValidationResult["coupon"]) => {
    if (!coupon) return "";

    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}%`;
    }
    return `$${coupon.discountValue}`;
  };

  return (
    <div className="space-y-3">
      {appliedCoupon ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-2">
            <div className="flex items-center gap-2">
              <IconDiscount className="size-4 text-green-800" />
              <span className="font-medium text-green-800 text-sm">"{appliedCoupon.code}" applied</span>
            </div>
            <Button className="text-green-800" onClick={handleRemoveCoupon} size="btn" type="button" variant="ghost">
              <IconX />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex rounded-md shadow-xs">
                        <Input
                          className="-me-px flex-1 rounded-e-none bg-card shadow-none focus-visible:z-10"
                          placeholder="Coupon Code"
                          {...field}
                        />
                        <button
                          className="inline-flex cursor-pointer items-center justify-center rounded-e-md border border-input bg-blue-700 px-3 font-medium text-card text-sm outline-none transition-colors hover:bg-blue-600 focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isValidating}
                          type="submit"
                        >
                          <LoadingSwap isLoading={isValidating}>Apply</LoadingSwap>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {validationResult && !validationResult.isValid && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
              <X className="h-4 w-4 flex-shrink-0 text-red-600" />
              <span className="text-red-800 text-sm">{validationResult.error}</span>
            </div>
          )}

          {validationResult && validationResult.isValid && (
            <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 text-sm">Valid coupon! Click "Apply" to use it.</span>
              </div>
              <div className="text-green-700 text-sm">You'll save ${validationResult.discountAmount.toFixed(2)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
