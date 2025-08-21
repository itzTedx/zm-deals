"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

import { FeedbackCard } from "@/components/feedback-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { PRODUCT } from "@/data/product";

import { ReviewCard } from "./write-review";

export const ReviewsModal = () => {
  const [open, setOpen] = useQueryState("reviews", parseAsBoolean.withDefault(false));
  const { reviews } = PRODUCT;
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="border-b p-6">
          <DialogTitle>Item Reviews</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[620px] px-3">
          <div className="mx-3 mt-4 rounded-xl bg-card p-3">
            <ReviewCard reviews={reviews} />
          </div>
          <div className="mt-3 space-y-6 px-3 pb-6">
            {reviews.map((review) => (
              <FeedbackCard key={review.id} review={review} />
            ))}
          </div>
          <ScrollBar />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
