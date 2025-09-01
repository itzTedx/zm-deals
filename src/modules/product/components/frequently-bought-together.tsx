"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconCheckboxFilled, IconCurrency } from "@/assets/icons";

import { calculateDiscount } from "@/lib/utils";
import { addComboDealToCart } from "@/modules/cart/actions/mutation";
import type { ComboDealWithProducts } from "@/modules/combo-deals/types";

import { ProductQueryResult } from "../types";

interface FrequentlyBoughtTogetherProps {
  comboDeals: ComboDealWithProducts[];
  currentProduct: ProductQueryResult;
}

export function FrequentlyBoughtTogether({ comboDeals, currentProduct }: FrequentlyBoughtTogetherProps) {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

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

  async function handleAddComboToCart() {
    startTransition(async () => {
      try {
        // Add the combo deal as a single cart item
        const result = await addComboDealToCart(comboDeal.id, 1);
        if (!result.success) {
          toast.error(result.error || "Failed to add combo deal to cart");
          return;
        }

        toast.success("Combo deal added to cart successfully!");
        router.push("/cart");
      } catch (error) {
        console.error("Error adding combo deal to cart:", error);
        toast.error("Failed to add combo deal to cart");
      }
    });
  }

  return (
    <section className="container max-w-7xl space-y-4 px-4 pb-6 sm:space-y-6 sm:px-6 md:pb-8 lg:pb-12 xl:pb-16">
      <h2 className="font-medium text-gray-700 text-lg md:text-xl">Buy together for less</h2>

      <Card className="border-2 border-gray-100">
        <CardContent className="max-md:p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-6 lg:space-y-0">
            {/* Products Carousel */}
            <div className="flex flex-1 flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0">
              {/* Current Product */}
              <div className="basis-auto">
                <div className="relative flex w-full flex-col items-center space-y-2 rounded-lg border-2 border-blue-500 bg-blue-50 p-3 sm:w-48 sm:p-4">
                  <div className="-top-2 -right-2 absolute flex size-5 items-center justify-center rounded-full bg-white sm:size-6">
                    <IconCheckboxFilled className="relative z-10 size-5 text-blue-500 sm:size-6" />
                    <span className="absolute inset-0 rounded-full bg-card" />
                  </div>

                  <div className="relative size-16 overflow-hidden rounded-lg sm:size-20 md:size-24">
                    <Image
                      alt={currentProduct.title}
                      className="object-cover"
                      fill
                      src={currentProduct.images[0]?.media?.url || "/placeholder-product.jpg"}
                    />
                  </div>

                  <div className="text-center">
                    <p className="line-clamp-2 font-medium text-xs sm:text-sm">{currentProduct.title}</p>
                    <div className="flex items-center justify-center gap-1">
                      <IconCurrency className="size-2.5 text-brand-500 sm:size-3" />
                      <span className="font-medium text-xs sm:text-sm">{currentProduct.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plus Sign */}
              <div className="flex basis-auto items-center justify-center sm:pl-2">
                <div className="flex h-8 w-8 items-center justify-center sm:h-24 sm:w-12">
                  <span className="text-2xl text-gray-400 sm:text-3xl">+</span>
                </div>
              </div>

              {/* Other Products */}
              {otherProducts.map((comboProduct) => (
                <div className="basis-auto" key={comboProduct.id}>
                  <div className="relative flex w-full flex-col items-center space-y-2 rounded-lg border p-3 sm:w-48 sm:p-4">
                    <div className="relative size-16 overflow-hidden rounded-lg sm:size-20 md:size-24">
                      <Image
                        alt={comboProduct.product?.title || "Product"}
                        className="object-cover"
                        fill
                        src={comboProduct.product?.images?.[0]?.media?.url || "/placeholder-product.jpg"}
                      />
                    </div>

                    <div className="text-center">
                      <p className="line-clamp-2 font-medium text-xs sm:text-sm">{comboProduct.product?.title}</p>
                      <div className="flex items-center justify-center gap-1">
                        <IconCurrency className="size-2.5 text-brand-500 sm:size-3" />
                        <span className="font-medium text-xs sm:text-sm">{comboProduct.product?.price}</span>
                      </div>
                      <Badge className="absolute top-1 right-1 sm:top-2 sm:right-2" size="sm" variant="outline">
                        {comboProduct.quantity}x
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Combo Summary */}
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:w-80">
              <div className="space-y-2">
                <h3 className="font-semibold text-base sm:text-lg md:text-xl">{comboDeal.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{comboDeal.description}</p>

                {/* Combo Deal Images */}
                {comboDeal.images && comboDeal.images.length > 0 && (
                  <div className="relative h-24 w-full overflow-hidden rounded-lg sm:h-28 md:h-32">
                    <Image
                      alt={comboDeal.title}
                      className="object-cover"
                      fill
                      src={comboDeal.images[0]?.url || "/placeholder-product.jpg"}
                    />
                    {comboDeal.images.length > 1 && (
                      <div className="absolute top-1 right-1 rounded bg-black bg-opacity-75 px-1.5 py-0.5 text-white text-xs sm:top-2 sm:right-2 sm:px-2 sm:py-1">
                        +{comboDeal.images.length - 1} more
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">Original Price:</span>
                  <span className="text-gray-500 text-xs line-through sm:text-sm">
                    <IconCurrency className="inline size-2.5 text-gray-400 sm:size-3" />
                    {totalOriginalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">Combo Price:</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Badge className="text-xs" size="sm" variant="destructive">
                      Save {calculateDiscount(totalOriginalPrice, Number(comboDeal.comboPrice))}%
                    </Badge>
                    <span className="flex items-center font-bold text-base text-brand-600 sm:text-lg">
                      <IconCurrency className="size-3 sm:size-4" />
                      {comboDeal.comboPrice}
                    </span>
                  </div>
                </div>
              </div>

              <Button className="w-full" disabled={isLoading} onClick={handleAddComboToCart} size="lg">
                <LoadingSwap isLoading={isLoading}>Add Combo to cart</LoadingSwap>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
