"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { ChevronRightIcon, ChevronRightIconHandle } from "@/assets/icons/chevron";

import { useSession } from "@/lib/auth/client";
import { addToCart } from "@/modules/cart/actions/mutation";

import { ProductQueryResult } from "../../types";

interface Props {
  data: ProductQueryResult;
}

export const BuyButton = ({ data }: Props) => {
  const ref = useRef<ChevronRightIconHandle>(null);
  const { data: session } = useSession();
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  async function handleCheckout() {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addToCart(data.id.toString(), 1);

        if (!result.success) {
          toast.error(result.error || "Failed to add to cart");
          return;
        }

        toast.success("Added to cart successfully!");
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
