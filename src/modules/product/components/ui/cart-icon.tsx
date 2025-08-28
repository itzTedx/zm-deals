import Link from "next/link";

import { Button } from "@/components/ui/button";

import { IconShoppingBag2 } from "@/assets/icons/bag";

import { getCartItemCount } from "@/modules/cart/actions/query";

export const CartIcon = async () => {
  const itemCount = await getCartItemCount();
  return (
    <Button asChild className="relative" size="icon" variant="outline">
      <Link href="/account/cart">
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
