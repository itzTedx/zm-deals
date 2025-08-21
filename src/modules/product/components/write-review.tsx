"use client";

import { useState } from "react";

import { parseAsBoolean, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/ui/rating";
import { StarRatingCells } from "@/components/ui/rating-cell";
import { SeparatorBox } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { IconEdit } from "@/assets/icons/edit";

import { pluralize } from "@/lib/functions/pluralize";
import { calculateAverageRating } from "@/lib/utils";

export const ReviewCard = ({ reviews }: { reviews: Review[] }) => {
  const [_, setReviewsDialog] = useQueryState("reviews", parseAsBoolean.withDefault(false));
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return (
      <div className="flex items-center divide-x">
        <p className="pr-3 font-medium text-4xl text-gray-800">0.0</p>
        <div className="space-y-1 pl-3">
          <StarRating readOnly value={0} />
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">0 Ratings</p>
            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />
            <p className="font-medium text-gray-500 text-sm underline">0 reviews</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center divide-x">
      <p className="pr-3 font-medium text-4xl text-gray-800">{calculateAverageRating(reviews)}</p>
      <div className="space-y-1 pl-3">
        <StarRating readOnly value={calculateAverageRating(reviews)} />
        <div className="flex items-center gap-2">
          <p className="text-gray-500 text-sm">{reviews.reduce((sum, review) => sum + review.rating, 0)} Ratings</p>
          <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />
          <Button
            className="font-medium text-gray-500 text-sm underline"
            onClick={() => setReviewsDialog(true)}
            variant="link"
          >
            {reviews.length} {pluralize("review", reviews.length)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const WriteReview = ({ reviews }: { reviews: Review[] }) => {
  const [starValue, setStarValue] = useState("0");
  return (
    <Card className="mt-4">
      <CardContent className="space-y-4">
        <ReviewCard reviews={reviews} />
        <SeparatorBox />
        <div className="space-y-3">
          <div className="flex w-full max-w-[360px] flex-col items-center gap-6">
            <StarRatingCells onValueChange={setStarValue} value={starValue} />
          </div>
          <Textarea className="min-h-[20ch]" />
          <Button className="w-full" variant="outline">
            <IconEdit className="size-4 text-muted-foreground" />
            Write a Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
