import Image from "next/image";
import Link from "next/link";

import Faqs from "@/components/faqs";
import { FeedbackCard } from "@/components/feedback-card";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator, SeparatorBox } from "@/components/ui/separator";

import { IconBook } from "@/assets/icons/book";
import { IconCheckboxCircle } from "@/assets/icons/checkbox";
import { IconChevronRight } from "@/assets/icons/chevron";
import { IconCurrency } from "@/assets/icons/currency";
import { IconEmail } from "@/assets/icons/email";
import { IconTeamCircle } from "@/assets/icons/team";
import { Logo } from "@/assets/logo";
import { Pattern1 } from "@/assets/patterns";

import { HOW_WORKS, NEWSLETTER_LIST, SOCIALS } from "@/data/constants";
import { PAST_DEALS, PRODUCT } from "@/data/product";
import { calculateDiscount } from "@/lib/utils";
import { ProductCard } from "@/modules/product/components/product-card";

export default function Home() {
  const { title, description, price, originalPrice, image } = PRODUCT;
  return (
    <main>
      <section className="container relative max-w-7xl border-x">
        <div className="grid grid-cols-1 items-center gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-12">
          <div className="space-y-6 md:space-y-9">
            <Badge>Offer ends in 2d 14h 23m</Badge>
            <div className="space-y-3">
              <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl">{title}</h1>
              <p className="text-base text-muted-foreground md:text-lg">{description}</p>
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
              <p className="relative flex items-center gap-1 font-bold text-gray-800 text-xl normal-nums md:text-2xl">
                <span>
                  <IconCurrency className="size-4 md:size-5" />
                </span>
                <span className="">{price}</span>
              </p>
            </div>
            <Button className="w-full md:w-auto">
              <span>Claim Your Deal Now</span>
            </Button>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image alt={title} className="w-full max-w-sm md:max-w-none" height={500} src={image} width={500} />
          </div>
        </div>
      </section>
      <section className="container relative max-w-7xl border-x py-12 md:py-20">
        <div className="relative flex items-center justify-between gap-4 pb-8 md:gap-6 md:pb-12">
          <SeparatorBox />
          <Badge variant="outline">How ZM Deals works</Badge>
          <SeparatorBox />
        </div>
        <div className="grid grid-cols-1 gap-6 divide-y md:grid-cols-3 md:divide-x md:divide-y-0 md:pb-12">
          {HOW_WORKS.map(({ title, description, icon: Icon }) => (
            <div className="px-0 py-6 text-center md:px-6 md:py-0" key={title}>
              <Icon className="mx-auto size-8 md:size-10" />
              <h3 className="mt-3 font-medium text-lg md:mt-4 md:text-xl">{title}</h3>
              <p className="mt-2 text-muted-foreground text-sm md:text-base">{description}</p>
            </div>
          ))}
        </div>
        <SeparatorBox />
      </section>
      <section className="container relative max-w-7xl border-x py-12 md:py-20">
        <Badge variant="outline">
          Sold Out{" "}
          <span className="ml-1 rounded-sm bg-brand-500/14 px-1.5 py-0.5 font-medium text-brand-500 text-xs">Fast</span>
        </Badge>

        <SectionHeader
          btnText="Past Deals"
          className="mt-6"
          description="These exclusive offers didn't last long! Here's a glimpse of what our community scored before they sold out. Don't miss the next one — subscribe and be ready when the new deal drops!"
          link="/past-deals"
          title="Previous Hot-Selling Deals"
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {PAST_DEALS.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
        <p className="mt-6 text-center text-muted-foreground text-sm md:text-base">
          Be the <span className="font-medium text-foreground">First</span> to Know About the{" "}
          <span className="font-medium text-foreground">Next Deal</span>
        </p>
      </section>
      <section className="container relative max-w-7xl border-x py-12 md:py-20">
        <div className="relative flex items-center justify-between gap-4 pb-8 md:gap-6 md:pb-12">
          <SeparatorBox />
          <Badge variant="outline">Happy Customers</Badge>
          <SeparatorBox />
        </div>
        <SectionHeader
          btnText="Testimonials"
          description="Thousands of shoppers trust ZM Deals for their weekly steals. Here's why they keep coming back."
          title="What People Are Saying"
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <FeedbackCard key={index} />
          ))}
        </div>
        <div className="-left-1.5 -bottom-1.5 pointer-events-none absolute z-10 size-2.5 shrink-0 rounded border bg-card" />
        <div className="-right-1.5 -bottom-1.5 pointer-events-none absolute z-10 size-2.5 shrink-0 rounded border bg-card" />
      </section>
      <Separator />
      <section className="container relative max-w-7xl border-x py-12 md:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 lg:gap-9">
          <div className="lg:sticky lg:top-20 lg:col-span-4 lg:h-fit">
            <Badge variant="outline">F.A.Q.s</Badge>
            <h2 className="mt-4 font-bold text-2xl sm:text-3xl md:mt-6 md:text-4xl">Frequently Asked Questions.</h2>
            <p className="mt-3 text-base text-muted-foreground md:mt-4 md:text-xl">
              Get <span className="font-medium text-foreground">Answers</span> to{" "}
              <span className="font-medium text-foreground">commonly</span> asked questions
            </p>
          </div>
          <div className="space-y-6 md:space-y-8 lg:col-span-6">
            <Faqs />
            <Button asChild className="w-full md:w-auto">
              <Link href="/faqs">
                See More <span className="text-muted-foreground">- FAQs</span>
                <IconChevronRight className="size-3 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="container relative max-w-7xl border-x py-12 md:py-20">
        <div className="container relative flex max-w-4xl items-center justify-between gap-4 pb-8 md:gap-6 md:pb-12">
          <SeparatorBox />
          <Badge className="size-6 md:size-7" variant="outline">
            <Logo className="size-4 shrink-0 text-gray-300 md:size-5" />
          </Badge>
          <SeparatorBox />
        </div>
        <div className="text-center">
          <Badge variant="outline">
            <IconTeamCircle />
            Happy Customers
          </Badge>
          <h2 className="mt-8 font-medium text-3xl">Join our community</h2>
          <p className="mt-3 mb-9 text-lg text-muted-foreground">
            Be the first to know about upcoming deals, share your experiences
          </p>
          <div className="container grid max-w-6xl grid-cols-3 gap-4">
            {SOCIALS.map(({ id, title, href, description, icon: Icon }) => (
              <div
                className="relative flex flex-col items-center justify-center rounded-3xl bg-card px-6 py-10 shadow-xl"
                key={id}
              >
                <Link className="absolute inset-0" href={href} />
                <Icon className="mx-auto size-12 text-gray-400" />
                <h3 className="mt-2 font-medium text-lg">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-lg text-lg text-muted-foreground">
            Be part of a community that saves together. Connect, share, and enjoy unbeatable weekly deals.
          </p>
          <Pattern1 className="mx-auto my-9" />

          <Badge variant="outline">
            <IconBook />
            Stay Informed
          </Badge>
          <h2 className="mt-8 font-medium text-3xl">Subscribe to our newsletter</h2>
          <p className="mx-auto mt-3 mb-9 max-w-lg text-lg text-muted-foreground">
            Get the latest product drops, coupon codes, and exclusive discounts delivered straight to your inbox.
          </p>
          <div className="relative mx-auto max-w-md">
            <Input
              className="peer h-12 ps-10 pe-16"
              id="email"
              placeholder="Enter your email to start saving..."
              type="email"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <IconEmail className="size-5" />
            </div>
            <Button
              aria-label="Submit search"
              className="absolute inset-y-0 end-3 my-auto h-7 bg-card shadow-lg"
              type="submit"
              variant="outline"
            >
              <IconChevronRight aria-hidden="true" className="size-3" />
            </Button>
          </div>
          <p className="mx-auto mt-3 max-w-lg text-gray-500 text-lg">
            We respect your privacy — no spam, just savings.
          </p>
          <div className="mx-auto mt-12 flex max-w-fit items-center gap-5">
            {NEWSLETTER_LIST.map((item) => (
              <p className="flex items-center gap-2 text-gray-600" key={item}>
                <IconCheckboxCircle className="size-5 text-success" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
