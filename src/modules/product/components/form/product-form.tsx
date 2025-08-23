"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconProduct } from "@/assets/icons/product";

import { ProductSchema, productSchema } from "../../schema";
import { Classification } from "./sections/classification";
import { ProductMeta } from "./sections/meta";
import { PricingInventory } from "./sections/pricing-inventory";
import { ProductDetails } from "./sections/product-details";
import { Scheduling } from "./sections/scheduling";

export const ProductForm = () => {
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      images: [],
      isFeatured: false,
      schedule: undefined,
    },
  });

  function onSubmit(values: ProductSchema) {
    console.log(values);
  }
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pt-4 pb-12">
      <Form {...form}>
        <form className="grid grid-cols-3 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="col-span-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="flex items-center gap-2 font-medium text-gray-600 text-xl leading-none">
                <IconProduct className="size-4 text-gray-500" /> <IconChevronRight className="text-gray-400" /> Add
                Product
              </h1>
            </div>
            <Button size="sm">Save Product</Button>
          </div>
          <div className="relative col-span-2 space-y-4">
            <ProductDetails />
            <PricingInventory />
            <ProductMeta />
          </div>
          <div className="sticky top-28 h-fit space-y-4">
            <Scheduling />
            <Classification />
          </div>
        </form>
      </Form>
    </div>
  );
};
