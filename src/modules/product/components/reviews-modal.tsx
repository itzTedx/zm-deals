"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

import { FeedbackCard } from "@/components/feedback-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { PRODUCT } from "@/data/product";

export const ReviewsModal = () => {
  const [open, setOpen] = useQueryState("reviews", parseAsBoolean.withDefault(false));
  const { reviews } = PRODUCT;
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Item Reviews</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[620px]">
          {reviews.map((review) => (
            <FeedbackCard key={review.id} review={review} />
          ))}
          <ScrollBar />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
