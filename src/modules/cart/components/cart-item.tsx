"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { IconCurrency, IconHeart, IconTrash, IconTruck } from "@/assets/icons";

import { useSession } from "@/lib/auth/client";
import { calculateDiscount } from "@/lib/utils";

import { removeFromCart, updateCartItemQuantity } from "../actions/mutation";
import { CartItem as CartItemType } from "../types";
import { Deadline } from "./deadline";

interface Props {
  item: CartItemType;
}

export const CartItem = ({ item }: Props) => {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemoveFromCart = (cartItemId: string) => {
    if (!session) {
      toast.error("Please sign in to manage your cart");
      return;
    }

    startTransition(async () => {
      try {
        const result = await removeFromCart(cartItemId);
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

  const handleQuantityChange = (newQuantity: string) => {
    if (!session) {
      toast.error("Please sign in to manage your cart");
      return;
    }

    const quantity = Number.parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      toast.error("Invalid quantity");
      return;
    }

    // Check stock availability
    const stock = item.product.inventory?.stock || 0;
    const isOutOfStock = item.product.inventory?.isOutOfStock || false;
    const currentQuantity = item.quantity;
    const maxAvailable = stock + currentQuantity;

    if (isOutOfStock) {
      toast.error("This item is out of stock");
      return;
    }

    if (quantity > maxAvailable) {
      toast.error(`Only ${maxAvailable} items available (${stock} in stock + ${currentQuantity} in cart)`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateCartItemQuantity(item.id, quantity);
        if (result.success) {
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update quantity");
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast.error("Failed to update quantity");
      }
    });
  };

  // Generate quantity options based on available stock
  const generateQuantityOptions = () => {
    const stock = item.product.inventory?.stock || 0;
    const isOutOfStock = item.product.inventory?.isOutOfStock || false;
    const currentQuantity = item.quantity;

    // If out of stock, only show current quantity
    if (isOutOfStock || stock <= 0) {
      return [currentQuantity];
    }

    // Calculate maximum available quantity (stock + current quantity in cart)
    const maxAvailable = Math.min(stock + currentQuantity, 10); // Cap at 10 for UX

    // Generate options from 1 to max available
    const options = [];
    for (let i = 1; i <= maxAvailable; i++) {
      options.push(i);
    }

    return options;
  };

  const quantityOptions = generateQuantityOptions();

  return (
    <Card key={item.product.id}>
      <CardContent className="relative flex gap-3 p-3">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50">
            <div className="size-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        )}

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
                onClick={() => handleRemoveFromCart(item.id)}
                variant="outline"
              >
                <IconTrash /> Remove
              </Button>
              <Button
                className="bg-transparent text-muted-foreground"
                disabled={isPending}
                onClick={() => handleRemoveFromCart(item.id)}
                variant="outline"
              >
                <IconHeart className="size-5" /> Move to wishlist
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between gap-3">
            <div className="flex flex-col items-end gap-1">
              <h5 className="inline-flex items-center gap-0.5 text-2xl tabular-nums">
                <IconCurrency className="size-5" />
                <b>{item.product.price}</b>
              </h5>

              <p className="text-gray-400 text-xs">
                <span className="line-through">{Number(item.product.compareAtPrice).toFixed(2)}</span>{" "}
                <span className="font-medium text-success uppercase">
                  {calculateDiscount(Number(item.product.compareAtPrice), Number(item.product.price))}% Off
                </span>
              </p>
              <p className="flex items-center gap-1 font-medium text-gray-500 text-xs">
                <IconTruck className="size-4 text-blue-600" /> Free Delivery
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {item.product.inventory && (
                <div className="text-xs">
                  {item.product.inventory.isOutOfStock ? (
                    <span className="font-medium text-red-600">Out of Stock</span>
                  ) : item.product.inventory.stock <= 5 ? (
                    <span className="font-medium text-orange-600">Only {item.product.inventory.stock} left!</span>
                  ) : null}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground text-xs" htmlFor="qty">
                  Qty
                </Label>
                <Select
                  defaultValue={item.quantity.toString()}
                  disabled={item.product.inventory?.isOutOfStock || false}
                  onValueChange={handleQuantityChange}
                >
                  <SelectTrigger className="w-16" id="qty">
                    <SelectValue placeholder="quantity" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 min-w-6">
                    {quantityOptions.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
