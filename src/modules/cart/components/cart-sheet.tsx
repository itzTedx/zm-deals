"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAtom } from "jotai";
import { ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { useSession } from "@/lib/auth/client";

import { createAnonymousCheckoutSession, createCartCheckoutSession } from "../../checkout/mutation";
import { clearCart } from "../actions/mutation";
import { cartItemCountAtom, cartTotalAtom, isCartOpenAtom } from "../atom";
import { useCartSync } from "../hooks/use-cart-sync";
import { prepareCartForCheckout, validateCartForCheckout } from "../utils/checkout";
import { CartItemCard } from "./cart-items";
import { DeliveryDeadline } from "./delivery-deadline";

export function CartSheet() {
  const router = useRouter();
  const { cart, setCart } = useCartSync();
  const [itemCount] = useAtom(cartItemCountAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const [isOpen, setIsOpen] = useAtom(isCartOpenAtom);

  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();

  const handleClearCart = () => {
    if (!session) {
      // Anonymous user - use client-side operation
      setCart([]);
      toast.success("Cart cleared");
      return;
    }

    // Authenticated user - use server action
    startTransition(async () => {
      try {
        const result = await clearCart();
        if (result.success) {
          // Update client-side state
          setCart([]);
          toast.success("Cart cleared");
        } else {
          toast.error(result.error || "Failed to clear cart");
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error("Failed to clear cart");
      }
    });
  };

  const handleCheckout = () => {
    // Validate cart before checkout
    const validation = validateCartForCheckout(cart);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid cart data");
      return;
    }

    startTransition(async () => {
      try {
        // Prepare checkout data using utility function
        const checkoutData = prepareCartForCheckout(cart);

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
  };

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetContent className="w-full max-w-[21rem] gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-3">
            <span className="text-xl">Shopping Cart</span>
            <span className="text-muted-foreground text-sm">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col p-4">
          {itemCount === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 font-medium">Your cart is empty</h3>
              <p className="mb-6 text-muted-foreground text-sm">Add some products to get started!</p>
              <Button asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {/* Delivery Deadline Component */}
                <DeliveryDeadline compact />

                {cart.map((item) => (
                  <CartItemCard item={item} key={item.product.id} />
                ))}
              </div>

              {/* Cart Actions */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{cartTotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" disabled={isPending || itemCount === 0} onClick={handleCheckout}>
                    {isPending ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/cart">View Full Cart</Link>
                  </Button>
                  <Button
                    className="w-full text-destructive hover:text-destructive"
                    disabled={isPending}
                    onClick={handleClearCart}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
