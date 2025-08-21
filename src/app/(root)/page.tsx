import { Community } from "@/components/community";

import { Deals, Hero, HowWeWorks, Testimonials } from "@/modules/home/sections";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <HowWeWorks />

      {/* Past Deals Section */}
      <Deals />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Community & Newsletter Section */}
      <Community />
    </main>
  );
}
