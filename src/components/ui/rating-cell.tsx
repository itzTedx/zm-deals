"use client";

import * as React from "react";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { IconStar } from "@/assets/icons";

import { cn } from "@/lib/utils";

const StarRatingCells = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  Omit<React.ComponentProps<typeof ToggleGroupPrimitive.Root>, "type"> & {
    type?: "single" | "multiple";
  }
>(({ className, type = "single", value, defaultValue, onValueChange, ...rest }, forwardedRef) => {
  return (
    <ToggleGroupPrimitive.Root
      className={cn("flex w-full max-w-[360px] gap-2", className)}
      ref={forwardedRef}
      type="single"
      {...rest}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <ToggleGroupPrimitive.Item
          className={cn(
            "group flex h-12 w-full items-center justify-center rounded-lg ring-1 ring-gray-200 ring-inset",
            "transition duration-200 ease-out",
            // hover
            "hover:bg-gray-50 hover:ring-transparent"
          )}
          key={i}
          value={`${i + 1}`}
        >
          <IconStar
            className={cn(
              "size-6 text-gray-300 transition duration-200 ease-out",
              // checked
              "group-has-[~[data-state=on]]:text-yellow-500 group-data-[state=on]:text-yellow-500"
            )}
          />
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
});
StarRatingCells.displayName = "StarRatingCells";

export { StarRatingCells };
