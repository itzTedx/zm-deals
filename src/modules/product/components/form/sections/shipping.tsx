import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { NumberInput } from "@/components/ui/input";

import { IconCurrency } from "@/assets/icons";

import { ProductSchema } from "@/modules/product/schema";

export const Shipping = () => {
  const form = useFormContext<ProductSchema>();
  const isFreeDelivery = form.watch("isDeliveryFree");
  const isCashOnDelivery = form.watch("cashOnDelivery");
  return (
    <Card className="p-0.5">
      <CardHeader className="px-4 pt-1.5 pb-1">
        <CardTitle className="text-sm">Shipping & Handling</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6 p-4">
        <div>
          <FormField
            control={form.control}
            name="cashOnDelivery"
            render={({ field }) => (
              <div className="flex items-start gap-2">
                <Checkbox
                  aria-describedby={"isCashOnDelivery-description"}
                  checked={!!field.value}
                  id={field.name}
                  onCheckedChange={field.onChange}
                />
                <div className="grow">
                  <div className="grid gap-2">
                    <FormLabel className="flex-col items-start" htmlFor={field.name}>
                      Cash on Delivery
                      <p className="font-normal text-muted-foreground text-xs" id={"isCashOnDelivery-description"}>
                        Uncheck to add a cash on delivery fee
                      </p>
                    </FormLabel>
                  </div>
                </div>
              </div>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryFee"
            render={({ field }) => (
              <div
                aria-label="Delivery fee"
                className="grid transition-all ease-in-out data-[state=expanded]:mt-3 data-[state=collapsed]:grid-rows-[0fr] data-[state=expanded]:grid-rows-[1fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:opacity-100"
                data-state={!isCashOnDelivery ? "collapsed" : "expanded"}
                id="deliveryFee"
                role="region"
              >
                <div className="-m-2 pointer-events-none overflow-hidden p-2">
                  <div className="pointer-events-auto relative">
                    <NumberInput
                      {...field}
                      aria-label="Delivery fee"
                      className="peer ps-8"
                      placeholder="Delivery Fee"
                    />
                    <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-sm peer-disabled:opacity-50">
                      <IconCurrency className="size-3 fill-muted-foreground" />
                    </span>
                  </div>
                </div>
                <FormMessage className="mt-1.5" />
              </div>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="isDeliveryFree"
            render={({ field }) => (
              <div className="flex items-start gap-2">
                <Checkbox
                  aria-describedby={"isDeliveryFree-description"}
                  checked={!!field.value}
                  id={field.name}
                  onCheckedChange={field.onChange}
                />
                <div className="grow">
                  <div className="grid gap-2">
                    <FormLabel className="flex-col items-start" htmlFor={field.name}>
                      Free Delivery
                      <p className="font-normal text-muted-foreground text-xs" id={"isDeliveryFree-description"}>
                        Uncheck to add a delivery fee
                      </p>
                    </FormLabel>
                  </div>
                </div>
              </div>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryFee"
            render={({ field }) => (
              <div
                aria-label="Delivery fee"
                className="grid transition-all ease-in-out data-[state=expanded]:mt-3 data-[state=collapsed]:grid-rows-[0fr] data-[state=expanded]:grid-rows-[1fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:opacity-100"
                data-state={isFreeDelivery ? "collapsed" : "expanded"}
                id="deliveryFee"
                role="region"
              >
                <div className="-m-2 pointer-events-none overflow-hidden p-2">
                  <div className="pointer-events-auto relative">
                    <NumberInput
                      {...field}
                      aria-label="Delivery fee"
                      className="peer ps-8"
                      placeholder="Delivery Fee"
                    />
                    <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-sm peer-disabled:opacity-50">
                      <IconCurrency className="size-3 fill-muted-foreground" />
                    </span>
                  </div>
                </div>
                <FormMessage className="mt-1.5" />
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
