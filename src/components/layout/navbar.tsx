import Link from "next/link";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconDiamond } from "@/assets/icons/diamonds";
import { IconHeart } from "@/assets/icons/heart";
import { IconMenu } from "@/assets/icons/menu";
import { IconSearch } from "@/assets/icons/search";
import { IconUser } from "@/assets/icons/user";
import { LogoIcon, LogoWordMark } from "@/assets/logo";

import { NAV_LINKS } from "@/data/constants";
import { getSession } from "@/lib/auth/server";
import { CartIcon } from "@/modules/product/components/ui/cart-icon";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import UserMenu from "./user-menu";

export const Navbar = async () => {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-999 h-fit">
      <div className="relative inset-shadow-[0_1px_12px_5px_oklch(1_0_0)] z-999 rounded-b-xl bg-card/85 shadow-lg backdrop-blur-2xl">
        <nav className="container relative z-999 mx-auto flex max-w-7xl items-center justify-between gap-4 py-2.5 font-helvetica max-md:justify-between md:gap-8">
          <div className="flex items-center gap-2 md:gap-6">
            <Link aria-label="go home" className="flex items-center gap-2" href="/">
              <LogoIcon />
              <LogoWordMark className="md:hidden" />
            </Link>
            <div className="hidden size-0.5 rounded-full bg-muted-foreground md:block" />
            {/* Desktop Navigation */}
            <ul className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((nav) => (
                <li key={nav.href}>
                  <Link className="font-medium text-gray-700 transition-colors hover:text-brand-600" href={nav.href}>
                    {nav.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className="flex items-center gap-1 font-medium text-gray-700 transition-colors hover:text-brand-600"
                  href="/deals"
                >
                  Categories <IconChevronRight className="rotate-90" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="relative mx-auto max-w-sm flex-1 sm:max-w-md">
            <Input
              className="peer h-10 ps-9 pe-14 text-sm sm:h-11 sm:ps-10 sm:pe-16 sm:text-base"
              id="email"
              placeholder="What are you looking for?"
              type="email"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <IconSearch className="size-4 sm:size-5" />
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

          <div className="flex items-center gap-2 md:gap-3">
            {session && !session.user.isAnonymous ? (
              <div className="flex items-center gap-2">
                <UserMenu />
                <div className="hidden flex-col md:flex">
                  <p className="font-medium text-sm">Hi! {session.user?.name}</p>
                  <p className="text-muted-foreground text-xs">{session.user?.email}</p>
                </div>
              </div>
            ) : (
              <Button asChild size="icon" variant="outline">
                <Link href="/auth/login">
                  <IconUser />
                </Link>
              </Button>
            )}
            <div className="hidden h-5 w-px flex-1 shrink-0 bg-gray-200 md:block" />
            <Button className="hidden sm:inline-flex" size="icon" variant="outline">
              <IconHeart className="size-5 text-muted-foreground hover:text-brand-500" />
            </Button>
            <CartIcon />

            {/* Mobile Sheet Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button className="md:hidden" size="icon">
                  <IconMenu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px]" side="right">
                <SheetHeader className="flex flex-row items-center gap-2 border-b">
                  <LogoIcon />
                  <LogoWordMark />
                  <SheetTitle className="sr-only text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-6 pt-0">
                  {/* Mobile Navigation */}
                  <ul className="flex flex-col gap-3">
                    {NAV_LINKS.map((nav) => (
                      <li key={nav.href}>
                        <Link
                          className="block py-2 font-medium text-lg transition-colors hover:text-brand-500"
                          href={nav.href}
                        >
                          {nav.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t pt-4">
                    <div className="flex flex-col gap-3">
                      <Button className="w-full" variant="outline">
                        <IconUser className="mr-2" />
                        <span>Sign In</span>
                      </Button>
                      <Button className="w-full" size="lg">
                        <IconDiamond className="mr-2 text-brand-500" />
                        <span>Claim the Combo Deal</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="-translate-x-1/2 pointer-events-none absolute bottom-0 left-0 size-2.5 translate-y-1/2 rounded border bg-card" />
          <div className="pointer-events-none absolute right-0 bottom-0 size-2.5 translate-x-1/2 translate-y-1/2 rounded border bg-card" />
          {/* <div className="-right-1.5 -translate-y-1/2 pointer-events-none absolute top-1/2 size-2.5 rounded border bg-card" />
          <div className="-left-1.5 -translate-y-1/2 pointer-events-none absolute top-1/2 size-2.5 rounded border bg-card" /> */}
        </nav>

        {/* <div className="-left-1.5 pointer-events-none absolute top-1/2 hidden size-2.5 translate-y-0.5 rounded border bg-card md:block" />
        <div className="-right-1.5 pointer-events-none absolute top-1/2 hidden size-2.5 translate-y-0.5 rounded border bg-card md:block" /> */}
      </div>

      {/* <Separator className="absolute top-1/2 left-0 translate-y-1.5" /> */}
    </header>
  );
};
