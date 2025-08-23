"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconProduct } from "@/assets/icons/product";

import { upsertProduct } from "../../actions/mutation";
import { ProductSchema, productSchema } from "../../schema";
import { Classification } from "./sections/classification";
import { ProductMeta } from "./sections/meta";
import { PricingInventory } from "./sections/pricing-inventory";
import { ProductDetails } from "./sections/product-details";
import { Scheduling } from "./sections/scheduling";

export const ProductForm = () => {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      overview: "",
      slug: "",
      price: 0,
      compareAtPrice: undefined,
      inventory: 0,
      images: [{ url: "/images/vacuum-holder.webp", isFeatured: true, order: 1 }],
      isFeatured: false,
      endsIn: undefined,
      schedule: undefined,
      meta: {
        title: undefined,
        description: undefined,
        keywords: undefined,
      },
    },
  });

  // DEBUG
  // const validation = productSchema.safeParse(form.watch());
  // console.log(validation);

  function onSubmit(values: ProductSchema) {
    startTransition(async () => {
      const { success, message } = await upsertProduct(values);

      if (!success) {
        toast.error(message);
        return;
      }

      if (success) {
        toast.success(message);
        router.push("/studio/products");
      }
    });
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
            <Button disabled={isLoading} size="sm">
              <LoadingSwap isLoading={isLoading}>Save Product</LoadingSwap>
            </Button>
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
