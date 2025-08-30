import * as React from "react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

import { getShortcutKey } from "../utils";

export interface ShortcutKeyProps extends React.ComponentProps<"span"> {
  keys: string[];
}

export const ShortcutKey = ({ ref, className, keys, ...props }: ShortcutKeyProps) => {
  const modifiedKeys = keys.map((key) => getShortcutKey(key));
  const ariaLabel = modifiedKeys.map((shortcut) => shortcut.readable).join(" + ");

  return (
    <Badge
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-0.5 bg-accent", className)}
      size="sm"
      variant="default"
      {...props}
      ref={ref}
    >
      {modifiedKeys.map((shortcut) => (
        <kbd
          className={cn(
            "inline-block min-w-2.5 text-center align-baseline font-medium font-sans text-[9px] text-[rgb(156,157,160)] capitalize",

            className
          )}
          key={shortcut.symbol}
          {...props}
          ref={ref}
        >
          {shortcut.symbol}
        </kbd>
      ))}
    </Badge>
  );
};

ShortcutKey.displayName = "ShortcutKey";
