import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import { IconCurrency } from "@/assets/icons";

import { calculateDiscount } from "@/lib/utils";
import type { ComboDealWithProducts } from "@/modules/combo-deals/types";

import { ProductQueryResult } from "../types";

interface FrequentlyBoughtTogetherProps {
  comboDeals: ComboDealWithProducts[];
  currentProduct: ProductQueryResult;
}

export function FrequentlyBoughtTogether({ comboDeals, currentProduct }: FrequentlyBoughtTogetherProps) {
  if (!comboDeals || comboDeals.length === 0) {
    return null;
  }

  // Get the first combo deal for display
  const comboDeal = comboDeals[0];

  // Get all products in the combo, excluding the current product
  const otherProducts = comboDeal.products
    .filter((cp) => cp.product && cp.product.id !== currentProduct.id)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (otherProducts.length === 0) {
    return null;
  }

  const totalOriginalPrice = comboDeal.products.reduce((total, cp) => {
    if (cp.product) {
      return total + Number(cp.product.price) * cp.quantity;
    }
    return total;
  }, 0);

  return (
    <section className="container max-w-7xl space-y-6 py-8">
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-700 text-lg">FREQUENTLY BOUGHT TOGETHER</h2>

        <Card className="border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-6 lg:space-y-0">
              {/* Products Carousel */}
              <div className="flex-1">
                <Carousel
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: false,
                    dragFree: true,
                  }}
                >
                  <CarouselContent className="-ml-2">
                    {/* Current Product */}
                    <CarouselItem className="basis-auto pl-2">
                      <div className="relative flex w-48 flex-col items-center space-y-2 rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                        <div className="-top-2 -left-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              clipRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              fillRule="evenodd"
                            />
                          </svg>
                        </div>

                        <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                          <Image
                            alt={currentProduct.title}
                            className="object-cover"
                            fill
                            src={currentProduct.images[0]?.media?.url || "/placeholder-product.jpg"}
                          />
                        </div>

                        <div className="text-center">
                          <p className="line-clamp-2 font-medium text-sm">{currentProduct.title}</p>
                          <div className="flex items-center justify-center gap-1">
                            <IconCurrency className="h-3 w-3 text-brand-400" />
                            <span className="font-medium text-sm">{currentProduct.price}</span>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Plus Sign */}
                    <CarouselItem className="flex basis-auto items-center pl-2">
                      <div className="flex h-24 w-12 items-center justify-center">
                        <span className="font-bold text-3xl text-gray-400">+</span>
                      </div>
                    </CarouselItem>

                    {/* Other Products */}
                    {otherProducts.map((comboProduct) => (
                      <CarouselItem className="basis-auto pl-2" key={comboProduct.id}>
                        <div className="relative flex w-48 flex-col items-center space-y-2 rounded-lg border p-4">
                          <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                            <Image
                              alt={comboProduct.product?.title || "Product"}
                              className="object-cover"
                              fill
                              src={comboProduct.product?.images?.[0]?.media?.url || "/placeholder-product.jpg"}
                            />
                          </div>

                          <div className="text-center">
                            <p className="line-clamp-2 font-medium text-sm">{comboProduct.product?.title}</p>
                            <div className="flex items-center justify-center gap-1">
                              <IconCurrency className="h-3 w-3 text-brand-400" />
                              <span className="font-medium text-sm">{comboProduct.product?.price}</span>
                            </div>
                            <Badge className="mt-1 text-xs" variant="outline">
                              {comboProduct.quantity > 1 ? `${comboProduct.quantity}x` : "1x"}
                            </Badge>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}

                    {/* Scroll Button */}
                    {otherProducts.length > 2 && (
                      <CarouselItem className="flex basis-auto items-center pl-2">
                        <CarouselNext className="static h-12 w-12 translate-y-0 border-2 border-gray-300 bg-white text-gray-600 hover:bg-gray-50" />
                      </CarouselItem>
                    )}
                  </CarouselContent>

                  {otherProducts.length > 2 && (
                    <CarouselPrevious className="-left-4 -translate-y-1/2 absolute top-1/2 h-12 w-12 border-2 border-gray-300 bg-white text-gray-600 hover:bg-gray-50" />
                  )}
                </Carousel>
              </div>

              {/* Combo Summary */}
              <div className="flex flex-col space-y-4 lg:w-80">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{comboDeal.title}</h3>
                  <p className="text-gray-600 text-sm">{comboDeal.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Original Price:</span>
                    <span className="text-gray-500 text-sm line-through">
                      <IconCurrency className="inline h-3 w-3 text-brand-400" />
                      {totalOriginalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Combo Price:</span>
                    <span className="font-bold text-brand-600 text-lg">
                      <IconCurrency className="inline h-4 w-4 text-brand-400" />
                      {comboDeal.comboPrice}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">You Save:</span>
                    <Badge className="text-sm" variant="destructive">
                      Save {calculateDiscount(totalOriginalPrice, Number(comboDeal.comboPrice))}%
                    </Badge>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <a href={`/deals/combo/${comboDeal.slug}`}>
                    BUY {comboDeal.products.length} TOGETHER FOR <IconCurrency className="ml-1 h-4 w-4" />
                    {comboDeal.comboPrice}
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
