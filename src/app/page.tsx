import { Community } from "@/components/community";
import { Separator } from "@/components/ui/separator";

import { FaqsSection, Hero, HowWeWorks, PastDeals, Testimonials } from "@/modules/home/sections";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <HowWeWorks />

      {/* Past Deals Section */}
      <PastDeals />

      {/* Testimonials Section */}
      <Testimonials />

      <Separator />

      {/* FAQ Section */}
      <FaqsSection />

      {/* Community & Newsletter Section */}
      <Community />
    </main>
  );
}
