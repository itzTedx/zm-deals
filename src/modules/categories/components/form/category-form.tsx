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

import { CategorySchema, categorySchema } from "@/modules/categories/schema";

import { upsertCategory } from "../../actions/mutation";
import { CategoryBanners } from "./sections/banners";
import { CategoryDetails } from "./sections/category-details";
import { CategoryMeta } from "./sections/meta";

interface CategoryFormProps {
  initialData?: CategorySchema;
  isEdit?: boolean;
  setModalOpen?: (open: boolean) => void;
}

export const CategoryForm = ({ initialData, isEdit = false, setModalOpen }: CategoryFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      thumbnail: initialData?.thumbnail ?? undefined,
      banners: initialData?.banners ?? [],
    },
    reValidateMode: "onBlur",
  });

  async function onSubmit(values: CategorySchema) {
    startTransition(async () => {
      try {
        const result = await upsertCategory(values);

        if (result.success) {
          toast.success(result.message);
          router.push("/studio/products/categories");
          setModalOpen?.(false);
        } else {
          toast.error(result.message ?? "Something went wrong");
        }
      } catch (error) {
        console.error("Error submitting category:", error);
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pt-4 pb-12">
      <Form {...form}>
        <form className="grid grid-cols-[3fr_2fr] gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="col-span-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="flex items-center gap-2 font-medium text-gray-600 text-xl leading-none">
                <IconProduct className="size-4 text-gray-500" /> <IconChevronRight className="text-gray-400" />{" "}
                {isEdit ? (initialData?.name ?? "Edit Category") : "Create Category"}
              </h1>
            </div>
            <Button disabled={isPending} size="sm">
              <LoadingSwap isLoading={isPending}>{isEdit ? "Update" : "Create"} Category</LoadingSwap>
            </Button>
          </div>
          <div className="space-y-4">
            <CategoryDetails />
            <CategoryMeta />
          </div>
          <CategoryBanners />
        </form>
      </Form>
    </div>
  );
};
