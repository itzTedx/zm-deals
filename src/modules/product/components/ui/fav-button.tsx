"use client";

import { useEffect, useState, useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconHeart, IconHeartFilled } from "@/assets/icons";

import { toggleWishlist } from "@/modules/wishlist/actions/mutation";
import { isInWishlist } from "@/modules/wishlist/actions/query";

import { ProductCardDate } from "../../types";

interface Props {
  data: ProductCardDate;
}

export const FavButton = ({ data }: Props) => {
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Check initial wishlist state
  useEffect(() => {
    const checkWishlistState = async () => {
      try {
        const inWishlist = await isInWishlist(data.id);
        setIsInWishlistState(inWishlist);
      } catch (error) {
        console.error("Error checking wishlist state:", error);
      }
    };

    checkWishlistState();
  }, [data.id]);

  const handleToggleWishlist = () => {
    startTransition(async () => {
      try {
        const result = await toggleWishlist(data.id);

        if (result.success) {
          setIsInWishlistState(result.added ?? false);
        } else {
          toast.error(result.error || "Failed to update wishlist");
        }
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        toast.error("Failed to update wishlist");
      }
    });
  };

  return (
    <Button
      className="absolute top-2 right-2 z-50 size-8 shadow-md hover:shadow-xl"
      disabled={isPending}
      onClick={handleToggleWishlist}
      size="btn"
      variant="secondary"
    >
      <LoadingSwap isLoading={isPending}>
        {isInWishlistState ? <IconHeartFilled className="size-5 text-red-500" /> : <IconHeart className="size-5" />}
      </LoadingSwap>
    </Button>
  );
};
