import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";

export const FeedbackCard = () => {
  return (
    <Card>
      <CardContent className="h-full">
        <Rating value={5} />
        <CardDescription className="mt-4 text-lg">
          The suction phone holder is amazing! I drive a lot and it keeps my phone perfectly stable, even on bumpy
          roads. Delivery was fast and packaging was great.
        </CardDescription>
      </CardContent>
      <CardFooter>
        <p className="font-medium text-gray-600 text-sm">Ahmed K</p>
      </CardFooter>
    </Card>
  );
};
