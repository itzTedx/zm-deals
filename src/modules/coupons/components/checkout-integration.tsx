"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { applyCoupon } from "../actions/mutation";
import type { CouponValidationResult } from "../types";
import { formatCurrency } from "../utils";
import { CouponValidator } from "./coupon-validator";

interface CheckoutIntegrationProps {
  cartTotal: number;
  orderId: string;
  onOrderComplete: (finalTotal: number) => void;
}

export function CheckoutIntegration({ cartTotal, orderId, onOrderComplete }: CheckoutIntegrationProps) {
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult["coupon"] | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(cartTotal);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCouponApplied = (result: CouponValidationResult) => {
    if (result.isValid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discountAmount);
      setFinalTotal(result.finalPrice);
    }
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFinalTotal(cartTotal);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // If a coupon is applied, apply it to the order
      if (appliedCoupon) {
        const applyResult = await applyCoupon({
          orderId,
          couponCode: appliedCoupon.code,
        });

        if (!applyResult.success) {
          console.error("Failed to apply coupon:", applyResult.error);
          // Handle error - maybe show a toast notification
          return;
        }
      }

      // Proceed with checkout
      onOrderComplete(finalTotal);
    } catch (error) {
      console.error("Checkout error:", error);
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Coupon Section */}
      <CouponValidator
        appliedCoupon={appliedCoupon}
        cartTotal={cartTotal}
        onCouponApplied={handleCouponApplied}
        onCouponRemoved={handleCouponRemoved}
      />

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Review your order details and total</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>

            {appliedCoupon && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
                <Separator />
              </>
            )}

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {appliedCoupon && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-green-800 text-sm">
                <strong>Savings:</strong> You saved {formatCurrency(discountAmount)} with coupon "{appliedCoupon.code}"
              </p>
            </div>
          )}

          <Button className="w-full" disabled={isProcessing} onClick={handleCheckout} size="lg">
            {isProcessing ? "Processing..." : `Complete Order - ${formatCurrency(finalTotal)}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
