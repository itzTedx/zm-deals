"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { validateCoupon } from "../actions/query";
import type { CouponValidationResult } from "../types";

const couponValidatorSchema = z.object({
  code: z.string().min(1, "Please enter a coupon code"),
});

type CouponValidatorData = z.infer<typeof couponValidatorSchema>;

interface CouponValidatorProps {
  cartTotal: number;
  onCouponApplied: (result: CouponValidationResult) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: CouponValidationResult["coupon"];
}

export function CouponValidator({ cartTotal, onCouponApplied, onCouponRemoved, appliedCoupon }: CouponValidatorProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Discount Code</CardTitle>
        <CardDescription>Enter a coupon code to apply a discount to your order.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {appliedCoupon ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Coupon "{appliedCoupon.code}" applied!</span>
              </div>
              <Badge className="bg-green-100 text-green-800" variant="secondary">
                {formatDiscount(appliedCoupon)}
              </Badge>
            </div>
            <Button className="w-full" onClick={handleRemoveCoupon} size="sm" type="button" variant="outline">
              Remove Coupon
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Coupon Code</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="Enter coupon code" {...field} className="flex-1" />
                        <Button className="px-6" disabled={isValidating} type="submit">
                          {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        {validationResult && !validationResult.isValid && !appliedCoupon && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <X className="h-4 w-4 flex-shrink-0 text-red-600" />
            <span className="text-red-800 text-sm">{validationResult.error}</span>
          </div>
        )}

        {validationResult && validationResult.isValid && !appliedCoupon && (
          <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Valid coupon! Click "Apply" to use it.</span>
            </div>
            <div className="text-green-700 text-sm">You'll save ${validationResult.discountAmount.toFixed(2)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
