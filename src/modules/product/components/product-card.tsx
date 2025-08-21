import Image from "next/image";

import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { IconTimer } from "@/assets/icons/timer";

interface Props {
  data: {
    title: string;
    image: string;
  };
}

export const ProductCard = ({ data }: Props) => {
  return (
    <Card>
      <CardContent className="h-full pb-0 max-md:p-3">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image alt={data.title} className="object-cover" fill src={data.image} />
        </div>
        <CardHeader className="py-2">
          <CardTitle className="max-md:text-sm">
            <h3 className="text-balance leading-snug">{data.title}</h3>
          </CardTitle>
        </CardHeader>
      </CardContent>
      <CardFooter>
        <p className="font-bold text-brand-600 text-sm sm:text-base">Sold Out</p>
        <CardAction>
          <div className="flex size-7 items-center justify-center rounded-lg bg-background">
            <IconTimer className="size-4 text-brand-500" />
          </div>
        </CardAction>
      </CardFooter>
    </Card>
  );
};
