"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { parseAsBoolean, useQueryState } from "nuqs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import StarRating from "@/components/ui/rating";
import { StarRatingCells } from "@/components/ui/rating-cell";
import { SeparatorBox } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { IconEdit } from "@/assets/icons/edit";

import { useSession } from "@/lib/auth/client";
import { pluralize } from "@/lib/functions/pluralize";
import { Review } from "@/server/schema";

import { calculateAverageRating } from "../actions/helper";
import { createReview, updateReview } from "../actions/mutation";
import { getCurrentUserReview } from "../actions/query";

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

interface WriteReviewProps {
  reviews: Review[];
  productId: string;
}

export const WriteReview = ({ reviews, productId }: WriteReviewProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [starValue, setStarValue] = useState("0");
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has already reviewed this product
  useEffect(() => {
    async function checkUserReview() {
      try {
        if (session?.user?.id) {
          const existingReview = await getCurrentUserReview(productId);
          if (existingReview) {
            setUserReview(existingReview);
            setStarValue(existingReview.rating.toString());
            setComment(existingReview.comment || "");
          }
        }
      } catch (error) {
        console.error("Error checking user review:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserReview();
  }, [productId, session?.user?.id]);

  const handleSubmitReview = () => {
    if (!starValue || starValue === "0") {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    startTransition(async () => {
      if (userReview) {
        // Update existing review
        const result = await updateReview({
          id: userReview.id,
          rating: Number.parseInt(starValue, 10),
          comment: comment.trim(),
        });

        if (result.success) {
          toast.success("Review updated successfully!");
          router.refresh();
        } else {
          toast.error("Failed to update review", {
            description: result.message,
          });
        }
      } else {
        // Create new review
        const result = await createReview({
          productId,
          rating: Number.parseInt(starValue, 10),
          comment: comment.trim(),
        });

        if (result.success) {
          toast.success("Review submitted successfully!");
          setStarValue("0");
          setComment("");
          router.refresh();
        } else {
          toast.error("Failed to submit review", {
            description: result.message,
          });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="space-y-4">
          <ReviewCard reviews={reviews} />
          <SeparatorBox />
          <div className="space-y-3">
            <div className="flex w-full max-w-[360px] flex-col items-center gap-6">
              <StarRatingCells onValueChange={setStarValue} value={starValue} />
            </div>
            <Textarea
              className="min-h-[20ch]"
              disabled
              onChange={(e) => setComment(e.target.value)}
              placeholder="Loading..."
              value={comment}
            />
            <Button className="w-full" disabled variant="outline">
              <LoadingSwap className="flex items-center gap-2" isLoading={true}>
                <IconEdit className="size-4 text-muted-foreground" />
                Loading...
              </LoadingSwap>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="space-y-4">
        <ReviewCard reviews={reviews} />
        <SeparatorBox />
        <div className="space-y-3">
          <div className="flex w-full max-w-[360px] flex-col items-center gap-6">
            <StarRatingCells onValueChange={setStarValue} value={starValue} />
          </div>
          <Textarea
            className="min-h-[20ch]"
            onChange={(e) => setComment(e.target.value)}
            placeholder={userReview ? "Update your review..." : "Share your experience with this product..."}
            value={comment}
          />
          <Button className="w-full" disabled={isPending} onClick={handleSubmitReview} variant="outline">
            <LoadingSwap className="flex items-center gap-2" isLoading={isPending}>
              <IconEdit className="size-4 text-muted-foreground" />
              {userReview ? "Update Review" : "Write a Review"}
            </LoadingSwap>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
