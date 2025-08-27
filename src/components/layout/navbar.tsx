import Link from "next/link";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconHeart } from "@/assets/icons/heart";
import { IconSearch } from "@/assets/icons/search";
import { LogoIcon } from "@/assets/logo";

import { NAV_LINKS } from "@/data/constants";
import { getSession } from "@/lib/auth/server";
import { CartIcon } from "@/modules/product/components/ui/cart-icon";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import UserMenu from "./user-menu";

export const Navbar = async () => {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-999 h-fit">
      <div className="relative z-999 rounded-b-xl bg-brand-600 text-card shadow-brand-lg">
        <nav className="container relative z-999 mx-auto flex max-w-7xl items-center justify-between gap-4 py-2.5 font-helvetica max-md:justify-between md:gap-8">
          <div className="flex items-center gap-2 md:gap-6">
            <Link aria-label="go home" className="flex items-center gap-2" href="/">
              <LogoIcon />
            </Link>
            <div className="hidden size-0.5 rounded-full bg-brand-100 md:block" />
            {/* Desktop Navigation */}
            <ul className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((nav) => (
                <li key={nav.href}>
                  <Link className="font-medium text-brand-50 transition-colors hover:text-brand-200" href={nav.href}>
                    {nav.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className="flex items-center gap-1 font-medium text-brand-50 transition-colors hover:text-brand-200"
                  href="/deals"
                >
                  Categories <IconChevronRight className="rotate-90" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="group relative mx-auto max-w-sm flex-1 sm:max-w-md">
            <Input
              className="peer h-10 bg-brand-400/50 ps-9 pe-14 text-sm placeholder:text-brand-100 hover:placeholder:text-muted-foreground sm:h-11 sm:ps-10 sm:pe-16 sm:text-base"
              id="search"
              placeholder="What are you looking for?"
              type="search"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-brand-100 group-hover:text-muted-foreground/80 group-active:text-muted-foreground/80 peer-disabled:opacity-50">
              <IconSearch className="size-4 sm:size-5" />
            </div>
            <Button
              aria-label="Submit search"
              className="absolute inset-y-0 end-2 my-auto h-6 shadow-lg sm:end-3 sm:h-7"
              type="submit"
            >
              <IconChevronRight aria-hidden="true" className="size-2.5 sm:size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {session && !session.user.isAnonymous ? (
              <UserMenu session={session} />
            ) : (
              <Button asChild className="text-muted-foreground" variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
            )}
            <div className="hidden h-5 w-px flex-1 shrink-0 bg-brand-400 md:block" />
            <Button className="hidden sm:inline-flex" size="icon" variant="outline">
              <IconHeart className="size-5 text-muted-foreground hover:text-brand-500" />
            </Button>
            <CartIcon />
          </div>
        </nav>
      </div>
    </header>
  );
};
