import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StarRating from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";

import { IconCurrency, IconTruck, IconWallet2 } from "@/assets/icons";

import { calculateDiscount, isWithinDays } from "@/lib/utils";

import { calculateAverageRating } from "../actions/helper";
import { ProductQueryResult } from "../types";
import { AnimatedCountdown } from "./ends-in-counter";
import { AddToCart } from "./ui/add-to-cart";
import { FavButton } from "./ui/fav-button";

interface Props {
  data: ProductQueryResult;
  showSeconds?: boolean;
  showAddToCart?: boolean;
}

export const ProductCard = ({ data, showSeconds = true, showAddToCart = false }: Props) => {
  return (
    <Card className="relative">
      <CardContent className="relative h-full p-3 max-md:p-3">
        <Link className="absolute inset-0 z-10" href={`/${data.slug}`} />
        <FavButton data={data} />
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image alt={data.title} className="object-cover" fill src={data.image} />
        </div>
        <CardHeader className="pt-2">
          <CardTitle className="text-sm sm:text-base">
            <h3 className="text-balance leading-snug">{data.title}</h3>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <p className="relative flex items-center gap-1 font-bold text-brand-600 text-lg normal-nums leading-none">
              <span>
                <IconCurrency className="size-4 text-brand-400" />
              </span>
              <span>{data.price}</span>
            </p>
            {data.compareAtPrice && (
              <>
                <p className="text-muted-foreground text-xs line-through decoration-brand-500">{data.compareAtPrice}</p>

                <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

                <Badge className="text-xs max-sm:hidden" size="sm" variant="success">
                  - {calculateDiscount(Number(data.compareAtPrice), Number(data.price))}%
                </Badge>
              </>
            )}
          </div>
        </CardHeader>
        <div className="my-1 flex flex-wrap items-center gap-1">
          {data.isDeliveryFree && (
            <div>
              <p className="flex items-center gap-1 font-medium text-gray-500 text-xs">
                <IconTruck className="size-4 text-success" /> Free Delivery
              </p>
            </div>
          )}
          {data.isDeliveryFree && data.cashOnDelivery && (
            <div className="hidden size-0.5 rounded-full bg-gray-300 sm:block sm:size-1" />
          )}
          {data.cashOnDelivery && (
            <div>
              <p className="flex items-center gap-1 font-medium text-gray-500 text-xs">
                <IconWallet2 className="size-4 text-blue-600" /> Cash on Delivery
              </p>
            </div>
          )}

          {(data.isDeliveryFree || data.cashOnDelivery) && data.inventory.stock < 5 && (
            <div className="hidden size-0.5 rounded-full bg-gray-300 sm:block sm:size-1" />
          )}

          {data.inventory.stock < 5 && (
            <div>
              <p className="flex items-center gap-1 font-medium text-destructive text-xs">
                <IconTruck className="size-4" /> Only {data.inventory.stock} left
              </p>
            </div>
          )}
        </div>
        {showAddToCart && <AddToCart className="relative z-50" data={data} onlyAddToCart />}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        {data.endsIn && isWithinDays(data.endsIn) && (
          <Badge className="text-[10px] sm:text-xs" size="sm">
            <AnimatedCountdown endsIn={data.endsIn} showSeconds={showSeconds} />
          </Badge>
        )}

        {data.reviews && data.reviews.length > 0 && (
          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <StarRating readOnly value={calculateAverageRating(data.reviews)} />

            <p className="hidden text-gray-600 text-xs sm:block">
              {data.reviews?.reduce((sum, review) => sum + review.rating, 0)}
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <Card className="relative">
      <CardContent className="relative h-full p-3 max-md:p-3">
        <div className="absolute top-3 right-3 z-20">
          <Skeleton className="size-6 rounded-full" />
        </div>
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>
        <CardHeader className="pt-2">
          <CardTitle className="text-sm sm:text-base">
            <Skeleton className="h-4 w-3/4" />
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-3 w-12" />
            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />
            <Skeleton className="h-5 w-12" />
          </div>
        </CardHeader>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <div>
            <div className="flex items-center gap-1">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="hidden size-0.5 rounded-full bg-gray-300 sm:block sm:size-1" />
          <div>
            <div className="flex items-center gap-1">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="hidden size-0.5 rounded-full bg-gray-300 sm:block sm:size-1" />
          <div>
            <div className="flex items-center gap-1">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton className="size-3 rounded" key={i} />
            ))}
          </div>
          <Skeleton className="ml-1 h-3 w-8" />
        </div>
      </CardFooter>
    </Card>
  );
};
