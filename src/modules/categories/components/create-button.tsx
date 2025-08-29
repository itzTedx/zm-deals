"use client";

import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export const CreateButton = ({ variant = "default" }: { variant?: "icon" | "default" }) => {
  // const [_, setIsOpen] = useQueryState("category", parseAsBoolean);
  return (
    <Button
      asChild
      // onClick={() => setIsOpen(true)}
      size={"sm"}
      type="button"
    >
      <Link href="/studio/products/categories/create">
        <Plus /> {variant === "icon" ? null : "Add Category"}
      </Link>
    </Button>
  );
};
