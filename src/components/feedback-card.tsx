import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import StarRating from "@/components/ui/rating";

import { formatDate } from "@/lib/functions/format-date";
import { Review } from "@/server/schema";

export const FeedbackCard = ({ review }: { review: Review }) => {
  return (
    <Card className="h-fit">
      <CardContent className="h-full">
        <StarRating readOnly value={review.rating} />
        <CardDescription className="mt-4 text-balance text-base text-foreground">{review.comment}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <p className="font-medium text-gray-600 text-sm">{review.user.name}</p>
        <dt className="text-gray-400 text-xs">
          {formatDate(review.createdAt, {
            relative: true,
            includeTime: true,
          })}
        </dt>
      </CardFooter>
    </Card>
  );
};
