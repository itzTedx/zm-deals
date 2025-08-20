import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "relative flex items-center justify-between gap-4 rounded-lg border p-4 text-sm transition-all",
  {
    variants: {
      variant: {
        default: "border-border bg-brand-500 text-foreground",
        destructive: "border-destructive/50 bg-destructive/10 text-destructive",
        warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
        success: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300",
        info: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300",
      },
      size: {
        inset: "mx-3",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "full",
    },
  }
);

interface BannerProps extends React.ComponentProps<"div">, VariantProps<typeof bannerVariants> {
  asChild?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  };
}

function Banner({
  className,
  variant,
  size,
  asChild = false,
  dismissible = false,
  onDismiss,
  icon,
  action,
  children,
  ...props
}: BannerProps) {
  const Comp = asChild ? SlotPrimitive.Slot : "div";

  return (
    <Comp className={cn(bannerVariants({ variant, size }), className)} data-slot="banner" {...props}>
      <div className="flex flex-1 items-start gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1">{children}</div>
      </div>

      <div className="flex items-center gap-2">
        {action && (
          <Button onClick={action.onClick} size="sm" variant={action.variant || "outline"}>
            {action.label}
          </Button>
        )}
        {dismissible && onDismiss && (
          <Button className="h-8 w-8 p-0" onClick={onDismiss} size="sm" variant="ghost">
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </Comp>
  );
}

export { Banner, bannerVariants };
export type { BannerProps };
