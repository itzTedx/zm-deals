"use client";

import * as React from "react";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { IconStar } from "@/assets/icons";

import { cn } from "@/lib/utils";

interface StarRatingCellsProps {
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const StarRatingCells = React.forwardRef<React.ComponentRef<typeof ToggleGroupPrimitive.Root>, StarRatingCellsProps>(
  ({ className, value, onValueChange, ...rest }, forwardedRef) => {
    return (
      <ToggleGroupPrimitive.Root
        className={cn("flex w-full max-w-[360px] gap-2", className)}
        onValueChange={onValueChange}
        ref={forwardedRef}
        type="single"
        value={value}
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
  }
);
StarRatingCells.displayName = "StarRatingCells";

interface HeartRatingCellsProps {
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const HeartRatingCells = React.forwardRef<React.ComponentRef<typeof ToggleGroupPrimitive.Root>, HeartRatingCellsProps>(
  ({ className, value, onValueChange, ...rest }, forwardedRef) => {
    return (
      <ToggleGroupPrimitive.Root
        className={cn("flex w-full max-w-[360px] gap-2", className)}
        onValueChange={onValueChange}
        ref={forwardedRef}
        type="single"
        value={value}
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
                "group-has-[~[data-state=on]]:text-red-500 group-data-[state=on]:text-red-500"
              )}
            />
          </ToggleGroupPrimitive.Item>
        ))}
      </ToggleGroupPrimitive.Root>
    );
  }
);
HeartRatingCells.displayName = "HeartRatingCells";

export { StarRatingCells, HeartRatingCells };
