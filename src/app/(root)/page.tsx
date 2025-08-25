import { Community } from "@/components/community";

import { Deals, Hero, HowWeWorks } from "@/modules/home/sections";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Past Deals Section */}
      <Deals />

      {/* How It Works Section */}
      <HowWeWorks />

      {/* Testimonials Section */}
      {/* <Testimonials /> */}

      {/* Community & Newsletter Section */}
      <Community />
    </main>
  );
}
