"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { ChevronRightIcon, ChevronRightIconHandle } from "@/assets/icons";

import { addToCart } from "@/modules/cart/actions/mutation";

import { ProductQueryResult } from "../../types";

interface Props {
  data: ProductQueryResult;
  quantity?: number;
}

export const BuyButton = ({ data, quantity = 1 }: Props) => {
  const ref = useRef<ChevronRightIconHandle>(null);
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  async function handleCheckout() {
    startTransition(async () => {
      try {
        const result = await addToCart(data.id.toString(), quantity);

        if (!result.success) {
          toast.error(result.error || "Failed to add to cart");
          return;
        }

        toast.success(`Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart successfully!`);
        router.refresh();
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
