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
    <section className="container max-w-7xl space-y-6 pb-8 md:pb-12 lg:pb-16">
      <div className="space-y-4">
        <h2 className="font-medium text-gray-700 text-lg">Buy together for less</h2>

        <Card className="border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-6 lg:space-y-0">
              {/* Products Carousel */}
              <div className="flex flex-1 gap-2">
                {/* Current Product */}
                <div className="basis-auto pl-2">
                  <div className="relative flex w-48 flex-col items-center space-y-2 rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                    <div className="-top-2 -right-2 absolute flex size-6 items-center justify-center rounded-full bg-white">
                      <IconCheckboxFilled className="relative z-10 size-6 text-blue-500" />
                      <span className="absolute inset-0 rounded-full bg-card" />
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
                </div>

                {/* Plus Sign */}
                <div className="flex basis-auto items-center pl-2">
                  <div className="flex h-24 w-12 items-center justify-center">
                    <span className="text-3xl text-gray-400">+</span>
                  </div>
                </div>

                {/* Other Products */}
                {otherProducts.map((comboProduct) => (
                  <div className="basis-auto pl-2" key={comboProduct.id}>
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
                        <Badge className="absolute top-2 right-2" size="sm" variant="outline">
                          {comboProduct.quantity}x
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Combo Summary */}
              <div className="flex flex-col space-y-4 lg:w-80">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{comboDeal.title}</h3>
                  <p className="text-gray-600 text-sm">{comboDeal.description}</p>

                  {/* Combo Deal Images */}
                  {comboDeal.images && comboDeal.images.length > 0 && (
                    <div className="relative h-32 w-full overflow-hidden rounded-lg">
                      <Image
                        alt={comboDeal.title}
                        className="object-cover"
                        fill
                        src={comboDeal.images[0]?.url || "/placeholder-product.jpg"}
                      />
                      {comboDeal.images.length > 1 && (
                        <div className="absolute top-2 right-2 rounded bg-black bg-opacity-75 px-2 py-1 text-white text-xs">
                          +{comboDeal.images.length - 1} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Original Price:</span>
                    <span className="text-gray-500 text-sm line-through">
                      <IconCurrency className="inline size-3 text-gray-400" />
                      {totalOriginalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Combo Price:</span>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs" size="sm" variant="destructive">
                        Save {calculateDiscount(totalOriginalPrice, Number(comboDeal.comboPrice))}%
                      </Badge>
                      <span className="flex items-center font-bold text-brand-600 text-lg">
                        <IconCurrency className="size-4" />
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
      </div>
    </section>
  );
}
