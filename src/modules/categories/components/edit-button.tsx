import Link from "next/link";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditButtonProps {
  categoryId: string;
  variant?: "icon" | "default";
  size?: "sm" | "default";
}

export const EditButton = ({ categoryId, variant = "default", size = "default" }: EditButtonProps) => {
  // const [_, setIsOpen] = useQueryState("category", parseAsBoolean);
  // const [__, setCategoryId] = useQueryState("categoryId", parseAsString);

  // const handleEdit = () => {
  //   setCategoryId(categoryId);
  //   setIsOpen(true);
  // };

  return (
    <Button asChild size={size} type="button" variant="outline">
      <Link href={`/studio/products/categories/${categoryId}`}>
        <Pencil className="h-4 w-4" />
        {variant === "default" && "Edit"}
      </Link>
    </Button>
  );
};
