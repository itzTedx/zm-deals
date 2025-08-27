"use client";

import { useTransition } from "react";
import Image from "next/image";

import { useAtom } from "jotai";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { IconCurrency } from "@/assets/icons/currency";

import { useSession } from "@/lib/auth/client";

import { removeFromCart } from "../actions/mutation";
import { removeFromCartAtom } from "../atom";
import { useCartSync } from "../hooks/use-cart-sync";
import { CartItem } from "../types";

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
    <div className="flex gap-3 rounded-lg border bg-white p-3" key={item.product.id}>
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
        <Image alt={item.product.title} className="object-cover" fill src={item.product.image} />
      </div>

      <div className="flex flex-1 justify-between">
        <div>
          <h4 className="line-clamp-2 font-medium text-sm">{item.product.title}</h4>
          <p className="text-muted-foreground text-xs">{Number(item.product.price).toFixed(2)}</p>
          <p className="font-medium text-primary text-xs">
            Total:{" "}
            <span className="inline-flex items-center gap-0.5 font-semibold">
              <IconCurrency className="size-3 text-muted-foreground" /> {Number(item.product.price) * item.quantity}
            </span>
          </p>
        </div>

        <Button
          className="text-destructive hover:text-destructive"
          disabled={isPending}
          onClick={() => handleRemoveFromCart(item.product.id)}
          size="btn"
          variant="ghost"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
