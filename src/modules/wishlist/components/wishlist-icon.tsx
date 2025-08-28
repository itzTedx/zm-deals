import Link from "next/link";

import { Button } from "@/components/ui/button";

import { IconHeart } from "@/assets/icons";

import { getWishlistItemCount } from "../actions/query";

export const WishlistIcon = async () => {
  const itemCount = await getWishlistItemCount();

  return (
    <Button asChild className="relative" size="icon" variant="outline">
      <Link href="/account/wishlist">
        <IconHeart className="size-5 text-muted-foreground hover:text-brand-500" />

        {itemCount > 0 && (
          <span className="-top-2 -right-2 absolute flex size-5 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700 text-xs shadow-lg">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>
    </Button>
  );
};
