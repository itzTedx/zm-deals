"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { parseAsBoolean, useQueryState } from "nuqs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Progress } from "@/components/ui/progress";
import StarRating from "@/components/ui/rating";
import { StarRatingCells } from "@/components/ui/rating-cell";
import { SeparatorBox } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { IconEdit, IconStar } from "@/assets/icons";

import { useSession } from "@/lib/auth/client";
import { pluralize } from "@/lib/functions/pluralize";
import { Review } from "@/server/schema";

import { calculateAverageRating } from "../actions/helper";
import { createReview, updateReview } from "../actions/mutation";
import { getCurrentUserReview } from "../actions/query";

export const ReviewCard = ({ reviews }: { reviews?: Review[] }) => {
  const [_, setReviewsDialog] = useQueryState("reviews", parseAsBoolean.withDefault(false));

  const fiveStar = reviews?.filter((review) => review.rating === 5).length || 0;
  const fourStar = reviews?.filter((review) => review.rating === 4).length || 0;
  const threeStar = reviews?.filter((review) => review.rating === 3).length || 0;
  const twoStar = reviews?.filter((review) => review.rating === 2).length || 0;
  const oneStar = reviews?.filter((review) => review.rating === 1).length || 0;

  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return (
      <div className="flex items-center divide-x rounded-lg bg-card p-4">
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
    <div className="space-y-3 rounded-lg bg-card p-6">
      <div className="flex items-center divide-x">
        <p className="pr-3 font-medium text-4xl text-gray-800">{calculateAverageRating(reviews)}</p>
        <div className="space-y-1 pl-3">
          <StarRating readOnly value={calculateAverageRating(reviews)} />
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">{reviews.length} Ratings</p>
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
      <SeparatorBox />
      <div className="space-y-2">
        {[
          { rating: 5, count: fiveStar, label: "5" },
          { rating: 4, count: fourStar, label: "4" },
          { rating: 3, count: threeStar, label: "3" },
          { rating: 2, count: twoStar, label: "2" },
          { rating: 1, count: oneStar, label: "1" },
        ].map(({ rating, count, label }) => {
          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <div className="flex items-center gap-2" key={rating}>
              <div className="flex w-8 items-center gap-1">
                <IconStar className="size-3 text-yellow-500" />
                <span className="text-gray-600 text-xs">{label}</span>
              </div>
              <div className="flex-1">
                <Progress className="h-3 rounded bg-gray-200" value={percentage} />
              </div>
              <span className="w-8 text-right text-gray-500 text-xs">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface WriteReviewProps {
  productId: string;
}

export const WriteReview = ({ productId }: WriteReviewProps) => {
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
