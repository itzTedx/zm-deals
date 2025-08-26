import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { IconCurrency } from "@/assets/icons/currency";

import { CreateButton } from "@/modules/categories/components/create-button";
import { ProductSchema } from "@/modules/product/schema";
import { Category } from "@/server/schema";

interface Props {
  categories: Category[];
}

export const Classification = ({ categories }: Props) => {
  const form = useFormContext<ProductSchema>();
  const isExpress = form.watch("isDeliveryFree");

  return (
    <Card className="p-0.5">
      <CardHeader className="px-4 pt-1.5 pb-1">
        <CardTitle className="text-sm">Classification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Categories</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <SelectTrigger className="w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0">
                      <SelectValue placeholder="Choose Category" />
                    </SelectTrigger>

                    <CreateButton variant="icon" />
                  </div>
                </FormControl>
                <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
                  <SelectGroup>
                    <SelectLabel className="ps-2">Categories</SelectLabel>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="truncate">{cat.name}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                  <Switch
                    aria-describedby={"isFeatured-description"}
                    checked={field.value}
                    className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2"
                    id={field.name}
                    onBlur={field.onBlur}
                    onCheckedChange={field.onChange}
                  />
                  <div className="grid grow gap-2">
                    <FormLabel htmlFor={field.name}>Featured</FormLabel>
                    <p className="text-muted-foreground text-xs" id={"isFeatured-description"}>
                      Featured product will be displayed on the home page.
                    </p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                data-state={isExpress ? "collapsed" : "expanded"}
                id="deliveryFee"
                role="region"
              >
                <div className="-m-2 pointer-events-none overflow-hidden p-2">
                  <div className="pointer-events-auto relative">
                    <Input
                      {...field}
                      aria-label="Delivery fee"
                      className="peer ps-8"
                      inputMode="numeric"
                      pattern="[0-9]*"
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
