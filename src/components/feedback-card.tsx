import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";

import { formatDate } from "@/lib/functions/format-date";

export const FeedbackCard = ({ review }: { review: Review }) => {
  return (
    <Card>
      <CardContent className="h-full">
        <Rating value={5} />
        <CardDescription className="mt-4 text-lg">{review.comment}</CardDescription>
      </CardContent>
      <CardFooter>
        <p className="font-medium text-gray-600 text-sm">{review.name}</p>
        <dt className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
          {formatDate(review.date, {
            relative: true,
          })}
        </dt>
      </CardFooter>
    </Card>
  );
};
