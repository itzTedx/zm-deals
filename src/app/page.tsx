import Image from "next/image";

import { FeedbackCard } from "@/components/feedback-card";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeparatorBox } from "@/components/ui/separator";

import { IconCurrency } from "@/assets/icons/currency";

import { HOW_WORKS } from "@/data/constants";
import { PAST_DEALS, PRODUCT } from "@/data/product";
import { calculateDiscount } from "@/lib/utils";
import { ProductCard } from "@/modules/product/components/product-card";

export default function Home() {
  const { title, description, price, originalPrice, image } = PRODUCT;
  return (
    <main>
      <section className="container relative max-w-7xl border-x">
        <div className="grid grid-cols-2 items-center gap-12 py-12">
          <div className="space-y-9">
            <Badge>Offer ends in 2d 14h 23m</Badge>
            <div className="space-y-3">
              <h1 className="font-bold text-6xl">{title}</h1>
              <p className="text-lg text-muted-foreground">{description}</p>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center gap-0.5 text-gray-400 normal-nums">
                  <span className="-translate-y-1/2 -translate-1/2 absolute top-1/2 left-1/2 h-px w-[115%] bg-gray-400" />
                  <span>
                    <IconCurrency className="size-3.5" />
                  </span>
                  <p className="">{originalPrice}</p>
                </div>
                <Badge size="sm" variant="destructive">
                  -{calculateDiscount(originalPrice, price)}%
                </Badge>
              </div>
              <p className="relative flex items-center gap-1 font-bold text-2xl text-gray-800 normal-nums">
                <span>
                  <IconCurrency className="size-5" />
                </span>
                <span className="">{price}</span>
              </p>
            </div>
            <Button>
              <span>Claim Your Deal Now</span>
            </Button>
          </div>
          <div>
            <Image alt={title} height={500} src={image} width={500} />
          </div>
        </div>
      </section>
      <section className="container relative max-w-7xl border-x py-20">
        <div className="relative flex items-center justify-between gap-6 pb-12">
          <SeparatorBox />
          <Badge variant="outline">How ZM Deals works</Badge>
          <SeparatorBox />
        </div>
        <div className="grid grid-cols-3 gap-6 divide-x pb-12">
          {HOW_WORKS.map(({ title, description, icon: Icon }) => (
            <div className="px-6 text-center" key={title}>
              <Icon className="mx-auto size-10" />
              <h3 className="mt-4 font-medium text-xl">{title}</h3>
              <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
        <SeparatorBox />
      </section>
      <section className="container relative max-w-7xl border-x py-20">
        <Badge variant="outline">
          Sold Out{" "}
          <span className="ml-1 rounded-sm bg-brand-500/14 px-1.5 py-0.5 font-medium text-brand-500 text-xs">Fast</span>
        </Badge>

        <SectionHeader
          btnText="Past Deals"
          className="mt-6"
          description="These exclusive offers didn’t last long! Here’s a glimpse of what our community scored before they sold out. Don’t miss the next one — subscribe and be ready when the new deal drops!"
          link="/past-deals"
          title="Previous Hot-Selling Deals"
        />
        <div className="mt-12 grid grid-cols-3 gap-6">
          {PAST_DEALS.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
        <p className="mt-6 text-center text-muted-foreground">
          Be the <span className="font-medium text-foreground">First</span> to Know About the{" "}
          <span className="font-medium text-foreground">Next Deal</span>
        </p>
      </section>
      <section className="container relative max-w-7xl border-x py-20">
        <div className="relative flex items-center justify-between gap-6 pb-12">
          <SeparatorBox />
          <Badge variant="outline">Happy Customers</Badge>
          <SeparatorBox />
        </div>
        <SectionHeader
          btnText="Testimonials"
          description="Thousands of shoppers trust ZM Deals for their weekly steals. Here’s why they keep coming back."
          title="What People Are Saying"
        />

        <div className="mt-12 grid grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <FeedbackCard key={index} />
          ))}
        </div>
      </section>
      <section className="container relative max-w-7xl border-x py-20">
        <Badge variant="outline">F.A.Q.s</Badge>

        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-4">
            <h2 className="mt-6 font-bold text-4xl">Frequently Asked Questions.</h2>
            <p className="mt-4 text-muted-foreground text-xl">
              Get <span className="font-medium text-foreground">Answers</span> to{" "}
              <span className="font-medium text-foreground">commonly</span> asked questions
            </p>
          </div>
          <div className="col-span-6">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
