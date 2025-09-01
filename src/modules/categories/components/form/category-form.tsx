"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AdminNavbar } from "@/components/layout/admin-navbar";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { CategorySchema, categorySchema } from "@/modules/categories/schema";

import { deleteCategory, upsertCategory } from "../../actions/mutation";
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
  const [isDeleteLoading, startDeleteTransition] = useTransition();
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

  function onDelete() {
    startDeleteTransition(async () => {
      const { success, message } = await deleteCategory(initialData?.id ?? "");

      if (!success) {
        toast.error("Something went wrong", {
          description: message,
          duration: 1000,
        });
        return;
      }

      toast.success("Success", {
        description: "Category deleted successfully",
        duration: 1000,
      });
      router.push("/studio/products/categories");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AdminNavbar currentPage={isEdit ? (initialData?.name ?? "Edit Category") : undefined}>
          <div className="flex items-center gap-2">
            {isEdit && (
              <Button disabled={isDeleteLoading} onClick={onDelete} size="sm" variant="destructive">
                <LoadingSwap isLoading={isDeleteLoading}>Delete</LoadingSwap>
              </Button>
            )}
            <Button disabled={isPending} size="sm">
              <LoadingSwap isLoading={isPending}>{isEdit ? "Update" : "Create"} Category</LoadingSwap>
            </Button>
          </div>
        </AdminNavbar>
        <div className="container grid max-w-6xl grid-cols-[3fr_2fr] gap-4 py-4">
          <div className="space-y-4">
            <CategoryDetails />
            <CategoryMeta />
          </div>
          <CategoryBanners />
        </div>
      </form>
    </Form>
  );
};
