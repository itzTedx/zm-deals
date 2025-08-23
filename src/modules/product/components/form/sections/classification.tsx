import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

import { ProductSchema } from "@/modules/product/schema";

export const Classification = () => {
  const form = useFormContext<ProductSchema>();

  return (
    <Card className="p-0.5">
      <CardHeader className="px-4 pt-1.5 pb-1">
        <CardTitle className="text-sm">Classification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
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
                    id="isFeatured"
                    onCheckedChange={field.onChange}
                  />
                  <div className="grid grow gap-2">
                    <FormLabel>Featured</FormLabel>
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
