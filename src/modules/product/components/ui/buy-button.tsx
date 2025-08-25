"use client";

import { useRef, useTransition } from "react";

import { useAtom } from "jotai";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { ChevronRightIcon, ChevronRightIconHandle } from "@/assets/icons/chevron";

import { addToCart } from "../../../cart/actions/mutation";
import { addToCartAtom, isCartOpenAtom } from "../../../cart/atom";
import { Deal } from "../../types";

interface Props {
  data: Deal;
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

        // Update client-side state for immediate UI feedback
        // Convert Deal to ProductType format for cart
        const productForCart = {
          id: data.id.toString(),
          title: data.title,
          overview: data.overview,
          description: data.description,
          slug: data.slug,
          price: data.price,
          compareAtPrice: null,
          image: data.featuredImage,
          isFeatured: false,
          endsIn: data.endsIn,
          schedule: null,
          status: "published" as const,
          metaId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addToCartClient({ product: productForCart, quantity: 1 });
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
