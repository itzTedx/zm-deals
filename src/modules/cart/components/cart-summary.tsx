"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { IconCurrency } from "@/assets/icons/currency";

import { useSession } from "@/lib/auth/client";
import { pluralize } from "@/lib/functions/pluralize";
import type { CouponValidationResult } from "@/modules/coupons/types";

import { createAnonymousCheckoutSession, createCartCheckoutSession } from "../../checkout/mutation";
import { useCartSync } from "../hooks/use-cart-sync";
import { prepareCartForCheckout, validateCartForCheckout } from "../utils/checkout";
import { CouponSection } from "./coupon-section";

interface CartSummaryProps {
  cartLength: number;
  cartTotal: number;
}

export function CartSummary({ cartLength, cartTotal }: CartSummaryProps) {
  const { cart } = useCartSync();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult["coupon"] | undefined>();
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(cartTotal);

  const handleCouponApplied = (result: CouponValidationResult) => {
    if (result.isValid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discountAmount);
      setFinalTotal(result.finalPrice);
    }
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(undefined);
    setDiscountAmount(0);
    setFinalTotal(cartTotal);
  };

  function handleCheckout() {
    // Validate cart before checkout
    const validation = validateCartForCheckout(cart);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid cart data");
      return;
    }

    startTransition(async () => {
      try {
        // Prepare checkout data using utility function with coupon information
        const checkoutData = prepareCartForCheckout(cart, discountAmount, finalTotal, appliedCoupon?.code);

        if (session) {
          // Authenticated user
          const result = await createCartCheckoutSession(checkoutData);
          if (result.success && result.url) {
            // Redirect to Stripe checkout
            window.location.href = result.url;
          } else {
            toast.error(result.error || "Failed to create checkout session");
          }
        } else {
          // Anonymous user
          const result = await createAnonymousCheckoutSession(checkoutData);
          if (result.success && result.url) {
            // Redirect to Stripe checkout
            window.location.href = result.url;
          } else {
            toast.error(result.error || "Failed to create checkout session");
          }
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
        toast.error("Failed to proceed to checkout");
      }
    });
  }

  return (
    <div className="mt-6 h-fit space-y-3 rounded-md border p-4">
      <h3 className="font-semibold text-lg">Order Summary</h3>

      <CouponSection
        appliedCoupon={appliedCoupon}
        cartTotal={cartTotal}
        onCouponApplied={handleCouponApplied}
        onCouponRemoved={handleCouponRemoved}
      />

      <div className="flex flex-col gap-2">
        <div className="flex justify-between font-medium text-sm">
          <h4 className="text-muted-foreground">
            Subtotal ({cartLength} {pluralize("item", cartLength)})
          </h4>
          <p className="flex items-center gap-0.5 text-gray-700">
            <IconCurrency className="size-3" />
            {cartTotal.toFixed(2)}
          </p>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between font-medium text-sm">
            <h4 className="text-muted-foreground">Discount</h4>
            <p className="font-semibold text-green-700">-${discountAmount.toFixed(2)}</p>
          </div>
        )}

        <div className="flex justify-between font-medium text-sm">
          <h4 className="text-muted-foreground">Shipping Fee</h4>
          <p className="font-semibold text-green-700">Free</p>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-bold text-lg">
        <h4 className="text-gray-600">Total</h4>
        <p className="flex items-center gap-0.5 text-gray-800">
          <IconCurrency className="size-4" />
          {finalTotal.toFixed(2)}
        </p>
      </div>

      <Button className="w-full" disabled={isPending || cartLength === 0} onClick={handleCheckout}>
        {isPending ? "Processing..." : "Checkout"}
      </Button>
    </div>
  );
}
