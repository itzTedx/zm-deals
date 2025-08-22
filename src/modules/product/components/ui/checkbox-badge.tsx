"use client";

import { useRef } from "react";

import { Badge } from "@/components/ui/badge";

import { CircleCheckBigIcon, CircleCheckBigIconHandle } from "@/assets/icons/checkbox";

import { cn } from "@/lib/utils";

export const CheckboxBadge = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<CircleCheckBigIconHandle>(null);
  return (
    <Badge
      className={cn(className)}
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
      size="sm"
      variant="success"
      {...props}
    >
      <CircleCheckBigIcon ref={ref} size={14} /> {children}
    </Badge>
  );
};
