"use client";

import { useRef, useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { ChevronRightIcon, ChevronRightIconHandle } from "@/assets/icons/chevron";

import { signIn } from "@/lib/auth/client";

import { ProductQueryResult } from "../../product/types";
import { addToCart } from "../actions/mutation";

interface Props {
  data: ProductQueryResult;
  onCartUpdated?: () => void;
}

export const BuyButton = ({ data, onCartUpdated }: Props) => {
  const ref = useRef<ChevronRightIconHandle>(null);
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

        // If this is an anonymous user, create anonymous session
        if (result.anonymous) {
          try {
            // Create anonymous session
            await signIn.anonymous();
            toast.success("Added to cart successfully!");
            onCartUpdated?.();
          } catch (anonymousError) {
            console.error("Error creating anonymous session:", anonymousError);
            toast.error("Failed to create anonymous session");
          }
          return;
        }

        toast.success("Added to cart successfully!");
        onCartUpdated?.();
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
