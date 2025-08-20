import { FeedbackCard } from "@/components/feedback-card";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";

import { IconChevronRight } from "@/assets/icons/chevron";

import { WriteReview } from "@/modules/product/components/write-review";

export const Reviews = ({ reviews }: { reviews: Review[] }) => {
  return (
    <section className="container relative max-w-7xl border-x py-12 md:py-16 lg:py-20">
      <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="sticky top-12 h-fit">
          <SectionHeader description="What our customers are saying" hasButton={false} title="Ratings & Reviews" />
          <WriteReview reviews={reviews} />
        </div>

        <div className="grid gap-5">
          {reviews.slice(0, 6).map((review) => (
            <FeedbackCard key={review.id} review={review} />
          ))}
          <Button className="mx-auto w-fit">
            See More <span className="text-muted-foreground">- Reviews</span>{" "}
            <IconChevronRight className="size-3 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </section>
  );
};
