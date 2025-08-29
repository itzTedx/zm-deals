"use client";

import { Pencil } from "lucide-react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";

interface EditButtonProps {
  categoryId: string;
  variant?: "icon" | "default";
  size?: "sm" | "default";
}

export const EditButton = ({ categoryId, variant = "default", size = "default" }: EditButtonProps) => {
  const [_, setIsOpen] = useQueryState("category", parseAsBoolean);
  const [__, setCategoryId] = useQueryState("categoryId", parseAsString);

  const handleEdit = () => {
    setCategoryId(categoryId);
    setIsOpen(true);
  };

  return (
    <Button onClick={handleEdit} size={size} type="button" variant="ghost">
      <Pencil className="h-4 w-4" />
      {variant === "default" && "Edit"}
    </Button>
  );
};
