import { FeedbackCard } from "@/components/feedback-card";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { SeparatorBox } from "@/components/ui/separator";

import { FEEDBACKS } from "@/data/product";

export const Testimonials = () => {
  return (
    <section className="container relative max-w-7xl border-x py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="relative flex items-center justify-between gap-3 pb-6 sm:gap-4 sm:pb-8 md:gap-6 md:pb-12">
        <SeparatorBox />
        <Badge variant="outline">Happy Customers</Badge>
        <SeparatorBox />
      </div>
      <SectionHeader
        btnText="Testimonials"
        description="Thousands of shoppers trust ZM Deals for their weekly steals. Here's why they keep coming back."
        title="What People Are Saying"
      />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 md:mt-12 lg:grid-cols-3">
        {FEEDBACKS.slice(0, 6).map((review, index) => (
          <FeedbackCard key={index} review={review} />
        ))}
      </div>
      {/* <div className="-left-1.5 -bottom-1.5 pointer-events-none absolute z-10 size-2.5 shrink-0 rounded border bg-card" />
      <div className="-right-1.5 -bottom-1.5 pointer-events-none absolute z-10 size-2.5 shrink-0 rounded border bg-card" /> */}
    </section>
  );
};
