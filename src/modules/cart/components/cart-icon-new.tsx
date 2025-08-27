"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { IconShoppingBag2 } from "@/assets/icons/bag";

interface CartIconProps {
  itemCount: number;
}

export const CartIcon = ({ itemCount }: CartIconProps) => {
  return (
    <Button asChild className="relative" size="icon" variant="outline">
      <Link href="/cart">
        <IconShoppingBag2 className="size-5 text-muted-foreground hover:text-brand-500" />

        {itemCount > 0 && (
          <span className="-top-2 -right-2 absolute flex size-5 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700 text-xs shadow-lg">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>
    </Button>
  );
};
