"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { addToCart } from "@/modules/cart/actions/mutation";
import { ProductCard } from "@/modules/product/components";
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
        <ProductCard data={item.product} key={item.id} />
      ))}
    </div>
  );
};
