"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";

import { IconChevronRight } from "@/assets/icons/chevron";

export const SeeMoreReviews = () => {
  const [_, setReviewsDialog] = useQueryState("reviews", parseAsBoolean.withDefault(false));
  return (
    <Button className="mx-auto w-fit" onClick={() => setReviewsDialog(true)}>
      See More <span className="text-muted-foreground">- Reviews</span>{" "}
      <IconChevronRight className="size-3 text-muted-foreground" />
    </Button>
  );
};
