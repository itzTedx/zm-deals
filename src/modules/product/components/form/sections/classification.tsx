import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

import { CreateButton } from "@/modules/categories/components/create-button";
import { ProductSchema } from "@/modules/product/schema";
import { Category } from "@/server/schema";

interface Props {
  categories: Category[];
}

export const Classification = ({ categories }: Props) => {
  const form = useFormContext<ProductSchema>();

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
      </CardContent>
    </Card>
  );
};
