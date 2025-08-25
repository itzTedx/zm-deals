import { FeedbackCard } from "@/components/feedback-card";
import { SectionHeader } from "@/components/layout/section-header";

import { WriteReview } from "@/modules/product/components/write-review";
import { Review } from "@/server/schema";

import { ReviewsModal } from "../components/reviews-modal";
import { SeeMoreReviews } from "../components/see-more-reviews-button";

interface ReviewsProps {
  reviews: Review[];
  productId: string;
}

export const Reviews = ({ reviews, productId }: ReviewsProps) => {
  return (
    <section className="container relative max-w-7xl border-x py-12 md:py-16 lg:py-20">
      <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="top-24 h-fit md:sticky">
          <SectionHeader description="What our customers are saying" hasButton={false} title="Ratings & Reviews" />
          <WriteReview productId={productId} reviews={reviews} />
        </div>

        <div className="grid gap-5">
          {reviews.slice(0, 6).map((review) => (
            <FeedbackCard key={review.id} review={review} />
          ))}
          {reviews.length > 6 && <SeeMoreReviews />}
        </div>
      </div>
      <ReviewsModal reviews={reviews} />
    </section>
  );
};
