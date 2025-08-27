"use client";

import { useTransition } from "react";
import Image from "next/image";

import { useAtom } from "jotai";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { IconCurrency } from "@/assets/icons/currency";
import { IconHeart } from "@/assets/icons/heart";
import { IconTrash } from "@/assets/icons/trash";

import { useSession } from "@/lib/auth/client";

import { removeFromCart } from "../actions/mutation";
import { removeFromCartAtom } from "../atom";
import { useCartSync } from "../hooks/use-cart-sync";
import { CartItem } from "../types";
import { DeliveryDeadline } from "./delivery-deadline";

interface Props {
  item: CartItem;
}

export const CartItemCard = ({ item }: Props) => {
  const { data: session } = useSession();
  const { cart, setCart } = useCartSync();
  const [isPending, startTransition] = useTransition();
  const [, removeFromCartClient] = useAtom(removeFromCartAtom);

  const handleRemoveFromCart = (productId: string) => {
    if (!session) {
      // Anonymous user - use client-side operation
      removeFromCartClient(productId);
      toast.success("Item removed from cart");
      return;
    }

    // Authenticated user - use server action
    startTransition(async () => {
      try {
        const result = await removeFromCart(productId);
        if (result.success) {
          // Update client-side state
          setCart(cart.filter((item) => item.product.id !== productId));
          toast.success("Item removed from cart");
        } else {
          toast.error(result.error || "Failed to remove item");
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        toast.error("Failed to remove item from cart");
      }
    });
  };
  return (
    <Card key={item.product.id}>
      <CardContent className="flex gap-3 p-3">
        <div className="relative size-32 flex-shrink-0 overflow-hidden rounded-lg">
          <Image alt={item.product.title} className="object-cover" fill src={item.product.image} />
        </div>

        <div className="flex flex-1 justify-between">
          <div className="space-y-2">
            <h4 className="line-clamp-2 font-medium text-sm">{item.product.title}</h4>
            {/* <p className="text-muted-foreground text-xs">{Number(item.product.price).toFixed(2)}</p> */}
            <DeliveryDeadline />
            <div className="flex items-center gap-2">
              <Button
                className="text-muted-foreground"
                disabled={isPending}
                onClick={() => handleRemoveFromCart(item.product.id)}
                variant="outline"
              >
                <IconTrash /> Remove
              </Button>
              <Button
                className="text-muted-foreground"
                disabled={isPending}
                onClick={() => handleRemoveFromCart(item.product.id)}
                variant="outline"
              >
                <IconHeart className="size-5" /> Move to wishlist
              </Button>
            </div>
          </div>
          <div>
            <h5 className="inline-flex items-center gap-0.5 text-xl tabular-nums">
              <IconCurrency className="size-4" />
              <b>{item.product.price}</b>
            </h5>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
