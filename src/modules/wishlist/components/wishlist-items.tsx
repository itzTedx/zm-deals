"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconCurrency } from "@/assets/icons/currency";
import { IconHeartFilled } from "@/assets/icons/heart";
import { IconTrash } from "@/assets/icons/trash";

import { addToCart } from "@/modules/cart/actions/mutation";
import { removeFromWishlist } from "@/modules/wishlist/actions/mutation";

import { WishlistItem } from "../types";

interface Props {
  items: WishlistItem[];
}

export const WishlistItems = ({ items }: Props) => {
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const handleRemoveFromWishlist = (productId: string) => {
    setRemovingItems((prev) => new Set(prev).add(productId));

    startTransition(async () => {
      try {
        const result = await removeFromWishlist(productId);

        if (result.success) {
          toast.success("Removed from wishlist");
          // Refresh the page to update the list
          window.location.reload();
        } else {
          toast.error(result.error || "Failed to remove from wishlist");
        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Failed to remove from wishlist");
      } finally {
        setRemovingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    });
  };

  const handleAddToCart = (productId: string) => {
    setAddingToCart((prev) => new Set(prev).add(productId));

    startTransition(async () => {
      try {
        const result = await addToCart(productId, 1);

        if (result.success) {
          toast.success("Added to cart");
        } else {
          toast.error(result.error || "Failed to add to cart");
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to add to cart");
      } finally {
        setAddingToCart((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card className="overflow-hidden" key={item.id}>
          <CardContent className="p-0">
            <div className="relative">
              <Link href={`/${item.product.slug}`}>
                <Image
                  alt={item.product.title}
                  className="aspect-square w-full object-cover transition-transform hover:scale-105"
                  height={300}
                  src={item.product.image}
                  width={300}
                />
              </Link>

              {/* Remove from wishlist button */}
              <Button
                className="absolute top-2 right-2 size-8 shadow-md hover:shadow-xl"
                disabled={removingItems.has(item.product.id) || isPending}
                onClick={() => handleRemoveFromWishlist(item.product.id)}
                size="btn"
                variant="secondary"
              >
                <LoadingSwap isLoading={removingItems.has(item.product.id)}>
                  <IconTrash className="size-4" />
                </LoadingSwap>
              </Button>
            </div>

            <div className="p-4">
              <Link href={`/${item.product.slug}`}>
                <h3 className="font-semibold hover:text-primary">{item.product.title}</h3>
              </Link>

              <div className="mt-2 flex items-center gap-1">
                <IconCurrency className="size-4" />
                <span className="font-semibold">{item.product.price}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1"
                  disabled={addingToCart.has(item.product.id) || isPending}
                  onClick={() => handleAddToCart(item.product.id)}
                  size="sm"
                >
                  <LoadingSwap isLoading={addingToCart.has(item.product.id)}>Add to Cart</LoadingSwap>
                </Button>

                <Button
                  className="size-8 p-0"
                  disabled={removingItems.has(item.product.id) || isPending}
                  onClick={() => handleRemoveFromWishlist(item.product.id)}
                  size="btn"
                  variant="outline"
                >
                  <LoadingSwap isLoading={removingItems.has(item.product.id)}>
                    <IconHeartFilled className="size-4 text-red-500" />
                  </LoadingSwap>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
