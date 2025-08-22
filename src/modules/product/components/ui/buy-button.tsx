"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";

import { ChevronRightIcon, ChevronRightIconHandle } from "@/assets/icons/chevron";

export const BuyButton = () => {
  const ref = useRef<ChevronRightIconHandle>(null);
  return (
    <Button
      className="w-full justify-between gap-3"
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
      size="lg"
    >
      Claim this deal now <ChevronRightIcon ref={ref} />
    </Button>
  );
};
