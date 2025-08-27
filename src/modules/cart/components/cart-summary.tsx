"use client";

import { useEffect, useState, useTransition } from "react";

import NumberFlow from "@number-flow/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Separator } from "@/components/ui/separator";

import { IconCurrency } from "@/assets/icons/currency";

import { useSession } from "@/lib/auth/client";
import { pluralize } from "@/lib/functions/pluralize";
import type { CouponValidationResult } from "@/modules/coupons/types";

import { createAnonymousCheckoutSession, createCartCheckoutSession } from "../../checkout/mutation";
import { CartItem } from "../types";
import { prepareCartForCheckout, validateCartForCheckout } from "../utils/checkout";
import { Coupon } from "./coupon";

interface CartSummaryProps {
  cartItems: CartItem[];
  cartLength: number;
  cartTotal: number; // Keep for backward compatibility but calculate dynamically
}

export function CartSummary({ cartItems, cartLength, cartTotal }: CartSummaryProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  // const router = useRouter();

  // Calculate total dynamically from cart items
  const calculatedTotal = cartItems.reduce((total, item) => {
    const price = Number(item.product.price);
    return total + price * item.quantity;
  }, 0);

  // Use calculated total instead of prop
  const currentCartTotal = calculatedTotal;

  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult["coupon"] | undefined>();
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(currentCartTotal);

  // Update final total when cart total changes
  useEffect(() => {
    if (appliedCoupon) {
      // Recalculate discount and final total when cart changes
      // This would need to be implemented based on your coupon logic
      setFinalTotal(currentCartTotal - discountAmount);
    } else {
      setFinalTotal(currentCartTotal);
    }
  }, [currentCartTotal, appliedCoupon, discountAmount]);

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
    setFinalTotal(currentCartTotal);
  };

  // const handleClearCart = () => {
  //   if (!session) {
  //     toast.error("Please sign in to manage your cart");
  //     return;
  //   }

  //   startTransition(async () => {
  //     try {
  //       const result = await clearCart();
  //       if (result.success) {
  //         toast.success("Cart cleared");
  //         router.refresh();
  //       } else {
  //         toast.error(result.error || "Failed to clear cart");
  //       }
  //     } catch (error) {
  //       console.error("Error clearing cart:", error);
  //       toast.error("Failed to clear cart");
  //     }
  //   });
  // };

  function handleCheckout() {
    // Validate cart before checkout
    const validation = validateCartForCheckout(cartItems);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid cart data");
      return;
    }

    startTransition(async () => {
      try {
        // Prepare checkout data using utility function with coupon information
        const checkoutData = prepareCartForCheckout(cartItems, discountAmount, finalTotal, appliedCoupon?.code);

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

      <Coupon
        appliedCoupon={appliedCoupon}
        cartTotal={currentCartTotal}
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
            {currentCartTotal.toFixed(2)}
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
          <NumberFlow value={finalTotal} />
        </p>
      </div>

      <div className="space-y-2">
        <Button className="w-full" disabled={isPending || cartLength === 0} onClick={handleCheckout}>
          <LoadingSwap isLoading={isPending}>Checkout</LoadingSwap>
        </Button>
        {/* <Button
          className="w-full text-destructive hover:text-destructive"
          disabled={isPending || cartLength === 0}
          onClick={handleClearCart}
          size="sm"
          variant="ghost"
        >
          Clear Cart
        </Button> */}
      </div>
    </div>
  );
}
