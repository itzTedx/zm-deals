"use client";

import * as React from "react";

import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
        className
      )}
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      {...props}
    />
  );
}

function SeparatorBox({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-1 items-center", className)} {...props}>
      <div className="pointer-events-none size-2.5 shrink-0 rounded border bg-card" />
      <Separator className="flex-1" />
      <div className="pointer-events-none size-2.5 shrink-0 rounded border bg-card" />
    </div>
  );
}

export { Separator, SeparatorBox };
