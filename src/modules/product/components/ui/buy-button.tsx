"use client";

import { useRef, useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { ChevronRightIcon, ChevronRightIconHandle } from "@/assets/icons/chevron";

import { createCheckoutSession } from "@/modules/checkout/mutation";

import { Deal } from "../../types";

interface Props {
  data: Deal;
}

export const BuyButton = ({ data }: Props) => {
  const ref = useRef<ChevronRightIconHandle>(null);
  const [isLoading, startTransition] = useTransition();

  function handleCheckout() {
    startTransition(async () => {
      const url = await createCheckoutSession({
        productId: data.id.toString(),
        quantity: 2,
        name: data.title,
        description: data.description,
        price: Number(data.price),
        image: data.images[0].url,
      });

      console.log(url);

      if (!url) {
        toast.error("Something went wrong");
        return;
      }

      window.location.href = url;
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
        Claim this deal now <ChevronRightIcon ref={ref} />
      </LoadingSwap>
    </Button>
  );
};
