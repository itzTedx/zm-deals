import { FeedbackCard } from "@/components/feedback-card";
import { SectionHeader } from "@/components/layout/section-header";

import { WriteReview } from "@/modules/product/components/write-review";

import { ReviewsModal } from "../components/reviews-modal";
import { SeeMoreReviews } from "../components/see-more-reviews-button";

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
          <SeeMoreReviews />
        </div>
      </div>
      <ReviewsModal />
    </section>
  );
};
