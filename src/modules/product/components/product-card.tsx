import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StarRating from "@/components/ui/rating";

import { IconCurrency } from "@/assets/icons/currency";

import { calculateAverageRating, calculateDiscount } from "@/lib/utils";

import { Deal } from "../types";
import { AnimatedCountdown } from "./ends-in-counter";

interface Props {
  data: Deal;
}

export const ProductCard = ({ data }: Props) => {
  return (
    <Card>
      {/* <CardHeader className="flex items-center justify-between px-2 pb-2">
        <Badge size="sm">
          <AnimatedCountdown endsIn={data.endsIn} />
        </Badge>
        <div className="flex items-center gap-2">
          <StarRating readOnly value={calculateAverageRating(data.reviews)} />

          <p className="text-gray-600 text-xs">{data.reviews.reduce((sum, review) => sum + review.rating, 0)}</p>
        </div>
      </CardHeader> */}
      <CardContent className="relative h-full p-3 max-md:p-3">
        {/* <Badge className="absolute top-2 left-2 z-10" size="sm">
          <AnimatedCountdown endsIn={data.endsIn} />
        </Badge> */}
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image alt={data.title} className="object-cover" fill src={data.featuredImage} />
        </div>
        <CardHeader className="pt-2">
          <CardTitle className="max-md:text-sm">
            <h3 className="text-balance leading-snug">{data.title}</h3>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <p className="relative flex items-center gap-1 font-bold text-brand-600 text-lg normal-nums leading-none">
              <span>
                <IconCurrency className="size-4 text-brand-400" />
              </span>
              <span>{data.price}</span>
            </p>
            {data.originalPrice && (
              <>
                <p className="text-muted-foreground text-xs line-through decoration-brand-500">{data.originalPrice}</p>

                <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

                <Badge className="text-xs" size="sm" variant="destructive">
                  - {calculateDiscount(Number(data.originalPrice), Number(data.price))}%
                </Badge>
              </>
            )}
          </div>
        </CardHeader>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Badge size="sm">
          <AnimatedCountdown endsIn={data.endsIn} />
        </Badge>

        <div className="flex items-center gap-2">
          <StarRating readOnly value={calculateAverageRating(data.reviews)} />

          <p className="text-gray-600 text-xs">{data.reviews.reduce((sum, review) => sum + review.rating, 0)}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
