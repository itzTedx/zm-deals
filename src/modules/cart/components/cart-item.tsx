"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { IconCurrency } from "@/assets/icons/currency";
import { IconHeart } from "@/assets/icons/heart";
import { IconTrash } from "@/assets/icons/trash";
import { IconTruck } from "@/assets/icons/truck";

import { useSession } from "@/lib/auth/client";

import { removeFromCart } from "../actions/mutation";
import { CartItem as CartItemType } from "../types";
import { Deadline } from "./deadline";

interface Props {
  item: CartItemType;
}

export const CartItem = ({ item }: Props) => {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemoveFromCart = (productId: string) => {
    if (!session) {
      toast.error("Please sign in to manage your cart");
      return;
    }

    startTransition(async () => {
      try {
        const result = await removeFromCart(productId);
        if (result.success) {
          toast.success("Item removed from cart");
          router.refresh();
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
          <div className="space-y-3">
            <h4 className="line-clamp-2 font-medium text-lg">{item.product.title}</h4>
            <Deadline />

            <div className="flex items-center gap-2">
              <Button
                className="bg-transparent text-muted-foreground"
                disabled={isPending}
                onClick={() => handleRemoveFromCart(item.product.id)}
                variant="outline"
              >
                <IconTrash /> Remove
              </Button>
              <Button
                className="bg-transparent text-muted-foreground"
                disabled={isPending}
                onClick={() => handleRemoveFromCart(item.product.id)}
                variant="outline"
              >
                <IconHeart className="size-5" /> Move to wishlist
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between">
            <div className="flex flex-col items-end gap-1">
              <h5 className="inline-flex items-center gap-0.5 text-xl tabular-nums">
                <IconCurrency className="size-4" />
                <b>{item.product.price}</b>
              </h5>

              <p className="text-gray-400 text-xs">
                <span className="line-through">{Number(item.product.price).toFixed(2)}</span>{" "}
                <span className="font-medium text-success uppercase">10% Off</span>
              </p>
              <p className="flex items-center gap-1 font-medium text-gray-500 text-xs">
                <IconTruck className="size-4 text-blue-600" /> Free Delivery
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs" htmlFor="qty">
                Qty
              </Label>
              <Select defaultValue="1">
                <SelectTrigger className="w-16" id="qty">
                  <SelectValue placeholder="quantity" />
                </SelectTrigger>
                <SelectContent className="min-w-6">
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
