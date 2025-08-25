"use client";

import { useRef, useTransition } from "react";

import { useAtom } from "jotai";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { ChevronRightIcon, ChevronRightIconHandle } from "@/assets/icons/chevron";

import { signIn } from "@/lib/auth/client";
import { addToCart } from "@/modules/cart/actions/mutation";
import { addToCartAtom, isCartOpenAtom } from "@/modules/cart/atom";

import { ProductQueryResult } from "../../types";

interface Props {
  data: ProductQueryResult;
}

export const BuyButton = ({ data }: Props) => {
  const ref = useRef<ChevronRightIconHandle>(null);
  const [, addToCartClient] = useAtom(addToCartAtom);
  const [, setIsCartOpen] = useAtom(isCartOpenAtom);
  const [isLoading, startTransition] = useTransition();

  async function handleCheckout() {
    startTransition(async () => {
      try {
        // Add to cart on server
        const result = await addToCart(data.id.toString(), 1);

        if (!result.success) {
          toast.error(result.error || "Failed to add to cart");
          return;
        }

        // If this is an anonymous user, create anonymous session and use client-side cart
        if (result.anonymous) {
          try {
            // Create anonymous session
            await signIn.anonymous();

            // Add to client-side cart
            addToCartClient({ product: data, quantity: 1 });
            setIsCartOpen(true);

            toast.success("Added to cart successfully!");
          } catch (anonymousError) {
            console.error("Error creating anonymous session:", anonymousError);
            toast.error("Failed to create anonymous session");
          }
          return;
        }

        addToCartClient({ product: data, quantity: 1 });
        setIsCartOpen(true); // Open the cart after adding item

        toast.success("Added to cart successfully!");
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to add to cart");
      }
    });
  }

  return (
    <Button
      className="w-full"
      disabled={isLoading}
      onClick={handleCheckout}
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
      size="lg"
    >
      <LoadingSwap className="flex items-center justify-between gap-2" isLoading={isLoading}>
        Add to Cart <ChevronRightIcon ref={ref} />
      </LoadingSwap>
    </Button>
  );
};
