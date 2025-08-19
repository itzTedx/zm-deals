import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { IconCurrency } from "@/assets/icons/currency";

import { PRODUCT } from "@/data/product";
import { calculateDiscount } from "@/lib/utils";

export default function Home() {
  const { title, description, price, originalPrice, image } = PRODUCT;
  return (
    <main>
      <div className="overflow-x-clip">
        <section className="container relative max-w-7xl border-x">
          <div className="grid grid-cols-2 items-center gap-12 py-12">
            <div className="space-y-9">
              <Badge>Offer ends in 2d 14h 23m</Badge>
              <div className="space-y-3">
                <h1 className="font-bold text-6xl">{title}</h1>
                <p className="text-lg text-muted-foreground">{description}</p>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center gap-0.5 text-gray-400 normal-nums">
                    <span className="-translate-y-1/2 -translate-1/2 absolute top-1/2 left-1/2 h-px w-[115%] bg-gray-400" />
                    <span>
                      <IconCurrency className="size-3.5" />
                    </span>
                    <p className="">{originalPrice}</p>
                  </div>
                  <Badge variant="destructive">-{calculateDiscount(originalPrice, price)}%</Badge>
                </div>
                <p className="relative flex items-center gap-1 font-bold text-2xl text-gray-800 normal-nums">
                  <span>
                    <IconCurrency className="size-5" />
                  </span>
                  <span className="">{price}</span>
                </p>
              </div>
              <Button>
                <span>Claim Your Deal Now</span>
              </Button>
            </div>
            <div>
              <Image alt={title} height={500} src={image} width={500} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
