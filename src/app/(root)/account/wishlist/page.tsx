import { Suspense } from "react";
import Link from "next/link";

import { HeartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { ProductCard } from "@/modules/product/components";
import { getWishlistData } from "@/modules/wishlist/actions/query";

async function WishlistContent() {
  const data = await getWishlistData();

  if (data.itemCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <HeartIcon className="size-16 text-muted-foreground/50" />
        <h2 className="mt-4 font-semibold text-muted-foreground text-xl">Your wishlist is empty</h2>
        <p className="mt-2 text-muted-foreground text-sm">Start adding products to your wishlist to see them here</p>
        <Button asChild className="mt-4">
          <Link href="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.items.map((item) => (
        <ProductCard data={item.product} key={item.id} showAddToCart />
      ))}
    </div>
  );
}

export default function WishlistsPage() {
  return (
    <main>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-6 w-6" />
            <h1 className="font-bold text-2xl">My Wishlist</h1>
          </div>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <WishlistContent />
        </Suspense>
      </div>
    </main>
  );
}
