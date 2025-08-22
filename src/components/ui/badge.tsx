import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border font-medium transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-500 text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "bg-card text-muted-foreground shadow-lg [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-transparent bg-green-100 text-green-700 focus-visible:ring-green-200 dark:bg-green-600/60 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-200",
        destructive:
          "border-transparent bg-brand-200/20 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline: "bg-card text-muted-foreground shadow-lg [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      size: {
        default: "rounded-lg px-3 py-1 text-sm sm:py-1.5",
        sm: "rounded-md px-1.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "span";

  return <Comp className={cn(badgeVariants({ variant, size }), className)} data-slot="badge" {...props} />;
}

export { Badge, badgeVariants };
