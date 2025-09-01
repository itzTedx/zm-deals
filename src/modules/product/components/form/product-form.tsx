"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconChevronRight, IconProduct } from "@/assets/icons";

import { Category } from "@/server/schema";

import { deleteProduct, upsertProduct } from "../../actions/mutation";
import { ProductSchema, productSchema } from "../../schema";
import { getInitialValues } from "../../utils";
import { Classification, PricingInventory, ProductDetails, ProductMeta, Scheduling } from "./sections";
import { Shipping } from "./sections/shipping";

interface Props {
  initialData: ProductSchema | null;
  isEditMode: boolean;
  categories: Category[];
}

export const ProductForm = ({ initialData, isEditMode, categories }: Props) => {
  const [isLoading, startTransition] = useTransition();
  const [isDeleteLoading, startDeleteTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...getInitialValues(),
      ...initialData,
    },
    reValidateMode: "onBlur",
  });

  // DEBUG
  // const validation = productSchema.safeParse(form.watch());
  // console.log("validation success:", validation.success);
  // if (!validation.success) {
  //   console.log("validation errors:", z.prettifyError(validation.error));
  // }

  function onSubmit(values: ProductSchema) {
    startTransition(async () => {
      const { success, message } = await upsertProduct(values);

      if (!success) {
        toast.error("Something went wrong", {
          description: message,
          duration: 1000,
        });
        return;
      }

      if (success) {
        toast.success("Success", {
          description: message,
          duration: 1000,
        });
        router.push("/studio/products");
      }
    });
  }

  function onDelete() {
    startDeleteTransition(async () => {
      const { success, message } = await deleteProduct(initialData?.id ?? "");

      if (!success) {
        toast.error("Something went wrong", {
          description: message,
          duration: 1000,
        });
        return;
      }

      toast.success("Success", {
        description: "Product deleted successfully",
        duration: 1000,
      });
      router.push("/studio/products");
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pt-4 pb-12">
      <Form {...form}>
        <form className="grid grid-cols-3 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="col-span-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="flex items-center gap-2 font-medium text-gray-600 text-xl leading-none">
                <IconProduct className="size-4 text-gray-500" /> <IconChevronRight className="text-gray-400" />{" "}
                {isEditMode ? (initialData?.title ?? "Edit Product") : "Create Product"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <Button disabled={isDeleteLoading} onClick={onDelete} size="sm" variant="destructive">
                  <LoadingSwap isLoading={isDeleteLoading}>Delete</LoadingSwap>
                </Button>
              )}
              <Button disabled={isLoading} size="sm">
                <LoadingSwap isLoading={isLoading}>{isEditMode ? "Update" : "Create"} Product</LoadingSwap>
              </Button>
            </div>
          </div>
          <div className="relative col-span-2 space-y-4">
            <ProductDetails />
            <PricingInventory />
            <Shipping />
            <ProductMeta />
          </div>
          <div className="sticky top-28 h-fit space-y-4">
            <Scheduling />
            <Classification categories={categories} />
          </div>
        </form>
      </Form>
    </div>
  );
};
