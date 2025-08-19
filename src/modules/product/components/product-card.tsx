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
      <CardContent className="h-full">
        <Image alt={data.title} height={500} src={data.image} width={500} />
        <CardHeader>
          <CardTitle>
            <h3>{data.title}</h3>
          </CardTitle>
        </CardHeader>
      </CardContent>
      <CardFooter>
        <p className="font-bold text-brand-600">Sold Out</p>
        <CardAction>
          <div className="flex size-7 items-center justify-center rounded-lg bg-background">
            <IconTimer className="size-4 text-brand-500" />
          </div>
        </CardAction>
      </CardFooter>
    </Card>
  );
};
