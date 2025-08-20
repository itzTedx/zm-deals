import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";

import { formatDate } from "@/lib/functions/format-date";

export const FeedbackCard = ({ review }: { review: Review }) => {
  return (
    <Card>
      <CardContent className="h-full">
        <Rating value={5} />
        <CardDescription className="mt-4 text-balance text-base text-foreground">{review.comment}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <p className="font-medium text-gray-600 text-sm">{review.name}</p>
        <dt className="text-gray-400 text-xs">
          {formatDate(review.date, {
            relative: true,
            includeTime: true,
          })}
        </dt>
      </CardFooter>
    </Card>
  );
};
