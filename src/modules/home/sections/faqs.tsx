import Faqs from "@/components/faqs";
import { Badge } from "@/components/ui/badge";

export const FaqsSection = () => {
  return (
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-10 lg:gap-9">
        <div className="lg:sticky lg:top-20 lg:col-span-4 lg:h-fit">
          <Badge variant="outline">F.A.Q.s</Badge>
          <h2 className="mt-3 font-bold text-xl sm:mt-4 sm:text-2xl md:mt-6 md:text-3xl lg:text-4xl">
            Frequently Asked Questions.
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:mt-3 sm:text-base md:mt-4 md:text-lg lg:text-xl">
            Get <span className="font-medium text-foreground">Answers</span> to{" "}
            <span className="font-medium text-foreground">commonly</span> asked questions
          </p>
        </div>
        <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:col-span-6">
          <Faqs />
          {/* <Button asChild className="w-full text-sm sm:w-auto sm:text-base">
            <Link href="/faqs">
              See More <span className="text-muted-foreground">- FAQs</span>
              <IconChevronRight className="size-3 text-muted-foreground" />
            </Link>
          </Button> */}
        </div>
      </div>
    </section>
  );
};
