"use client";

import { Plus } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";

export const CreateButton = ({ variant = "default" }: { variant?: "icon" | "default" }) => {
  const [_, setIsOpen] = useQueryState("category", parseAsBoolean);
  return (
    <Button onClick={() => setIsOpen(true)} size={"sm"} type="button">
      <Plus /> {variant === "icon" ? null : "Add Category"}
    </Button>
  );
};
