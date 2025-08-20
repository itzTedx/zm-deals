import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeparatorBox } from "@/components/ui/separator";

import { IconBook } from "@/assets/icons/book";
import { IconCheckboxCircle } from "@/assets/icons/checkbox";
import { IconChevronRight } from "@/assets/icons/chevron";
import { IconEmail } from "@/assets/icons/email";
import { IconTeamCircle } from "@/assets/icons/team";
import { Logo } from "@/assets/logo";
import { Pattern1 } from "@/assets/patterns";

import { NEWSLETTER_LIST, SOCIALS } from "@/data/constants";
export const Community = () => {
  return (
    <section className="container relative max-w-7xl border-x px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:px-8 lg:py-20">
      <div className="container relative flex max-w-4xl items-center justify-between gap-3 pb-6 sm:gap-4 sm:pb-8 md:gap-6 md:pb-12">
        <SeparatorBox />
        <Badge className="size-5 sm:size-6 md:size-7" variant="outline">
          <Logo className="size-3 shrink-0 text-gray-300 sm:size-4 md:size-5" />
        </Badge>
        <SeparatorBox />
      </div>
      <div className="text-center">
        <Badge variant="outline">
          <IconTeamCircle />
          Happy Customers
        </Badge>
        <h2 className="mt-6 font-medium text-2xl sm:mt-8 sm:text-3xl">Join our community</h2>
        <p className="mt-2 mb-6 text-base text-muted-foreground sm:mt-3 sm:mb-9 sm:text-lg">
          Be the first to know about upcoming deals, share your experiences
        </p>
        <div className="container grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {SOCIALS.map(({ id, title, href, description, icon: Icon }) => (
            <div
              className="relative flex flex-col items-center justify-center rounded-2xl bg-card px-4 py-8 shadow-xl sm:rounded-3xl sm:px-6 sm:py-10"
              key={id}
            >
              <Link className="absolute inset-0" href={href} />
              <Icon className="mx-auto size-8 text-gray-400 sm:size-12" />
              <h3 className="mt-2 font-medium text-base sm:text-lg">{title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-lg text-base text-muted-foreground sm:mt-12 sm:text-lg">
          Be part of a community that saves together. Connect, share, and enjoy unbeatable weekly deals.
        </p>
        <Pattern1 className="mx-auto my-6 sm:my-9" />

        <Badge variant="outline">
          <IconBook />
          Stay Informed
        </Badge>
        <h2 className="mt-6 font-medium text-2xl sm:mt-8 sm:text-3xl">Subscribe to our newsletter</h2>
        <p className="mx-auto mt-2 mb-6 max-w-lg text-base text-muted-foreground sm:mt-3 sm:mb-9 sm:text-lg">
          Get the latest product drops, coupon codes, and exclusive discounts delivered straight to your inbox.
        </p>
        <div className="relative mx-auto max-w-sm sm:max-w-md">
          <Input
            className="peer h-10 ps-9 pe-14 text-sm sm:h-12 sm:ps-10 sm:pe-16 sm:text-base"
            id="email"
            placeholder="Enter your email to start saving..."
            type="email"
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <IconEmail className="size-4 sm:size-5" />
          </div>
          <Button
            aria-label="Submit search"
            className="absolute inset-y-0 end-2 my-auto h-6 bg-card shadow-lg sm:end-3 sm:h-7"
            type="submit"
            variant="outline"
          >
            <IconChevronRight aria-hidden="true" className="size-2.5 sm:size-3" />
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-lg text-gray-500 text-sm sm:mt-3 sm:text-base lg:text-lg">
          We respect your privacy — no spam, just savings.
        </p>
        <div className="mx-auto mt-8 flex max-w-fit flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:gap-5">
          {NEWSLETTER_LIST.map((item) => (
            <p className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm" key={item}>
              <IconCheckboxCircle className="size-4 text-success sm:size-5" />
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};
