"use client";

import { useEffect, useState } from "react";

import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { getCategory } from "@/modules/categories/actions/query";
import { CategoryForm } from "@/modules/categories/components/form/category-form";
import { CategorySchema } from "@/modules/categories/schema";
import { transformCategoryForForm } from "@/modules/categories/utils";

export const CategoryModal = () => {
  const [isOpen, setIsOpen] = useQueryState("category", parseAsBoolean.withDefault(false));
  const [categoryId, setCategoryId] = useQueryState("categoryId", parseAsString.withDefault(""));
  const [categoryData, setCategoryData] = useState<CategorySchema | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = Boolean(categoryId && categoryId !== "create");

  // Fetch category data when editing
  useEffect(() => {
    if (isEdit && categoryId) {
      setIsLoading(true);
      getCategory(categoryId)
        .then((category) => {
          if (category) {
            // Use the utility function to properly transform the category data
            const transformedData = transformCategoryForForm(category);
            setCategoryData(transformedData);
          }
        })
        .catch((error) => {
          console.error("Error fetching category:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setCategoryData(undefined);
    }
  }, [categoryId, isEdit]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCategoryId(null);
      setCategoryData(undefined);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent className="md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-sm">Loading category...</div>
          </div>
        ) : (
          <CategoryForm initialData={categoryData} isEdit={isEdit} setModalOpen={setIsOpen} />
        )}
      </DialogContent>
    </Dialog>
  );
};
