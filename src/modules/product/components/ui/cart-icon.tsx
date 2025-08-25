"use client";

import { useAtom } from "jotai";

import { Button } from "@/components/ui/button";

import { IconShoppingBag2 } from "@/assets/icons/bag";

import { cartItemCountAtom, isCartOpenAtom } from "../../../cart/atom";

export const CartIcon = () => {
  const [itemCount] = useAtom(cartItemCountAtom);
  const [, setIsCartOpen] = useAtom(isCartOpenAtom);
  return (
    <Button
      className="relative hidden sm:inline-flex"
      onClick={() => setIsCartOpen(true)}
      size="icon"
      variant="outline"
    >
      <IconShoppingBag2 className="size-5 text-muted-foreground hover:text-brand-500" />

      {itemCount > 0 && (
        <span className="-top-2 -right-2 absolute flex size-5 items-center justify-center rounded-full bg-brand-500 font-medium text-primary-foreground text-xs">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Button>
  );
};
