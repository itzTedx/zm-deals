"use client";

import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { CategoryForm } from "@/modules/categories/components/form/category-form";

export const CategoryModal = () => {
  const [isOpen, setIsOpen] = useQueryState("category", parseAsBoolean.withDefault(false));
  const [categoryId, setCategoryId] = useQueryState("categoryId", parseAsString.withDefault(""));

  const isEdit = Boolean(categoryId && categoryId !== "create");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCategoryId(null);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Category</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <CategoryForm isEdit={isEdit} />
      </DialogContent>
    </Dialog>
  );
};
