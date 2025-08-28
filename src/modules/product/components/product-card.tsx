import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StarRating from "@/components/ui/rating";

import { IconCurrency } from "@/assets/icons";

import { calculateDiscount } from "@/lib/utils";

import { calculateAverageRating } from "../actions/helper";
import { ProductQueryResult } from "../types";
import { AnimatedCountdown } from "./ends-in-counter";
import { FavButton } from "./ui/fav-button";

interface Props {
  data: ProductQueryResult;
}

export const ProductCard = ({ data }: Props) => {
  return (
    <Card className="relative">
      <Link className="absolute inset-0 z-10" href={`/${data.slug}`} />

      <CardContent className="relative h-full p-3 max-md:p-3">
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
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        {data.endsIn && (
          <Badge className="text-[10px] sm:text-xs" size="sm">
            <AnimatedCountdown endsIn={data.endsIn} />
          </Badge>
        )}

        <div className="flex items-center gap-1 md:gap-2">
          <StarRating readOnly value={calculateAverageRating(data.reviews)} />

          <p className="hidden text-gray-600 text-xs sm:block">
            {data.reviews?.reduce((sum, review) => sum + review.rating, 0)}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};
