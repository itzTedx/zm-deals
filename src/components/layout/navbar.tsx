"use client";

import Link from "next/link";

import { IconDiamond } from "@/assets/icons/diamonds";
import { IconMenu } from "@/assets/icons/menu";
import { IconUser } from "@/assets/icons/user";
import { LogoIcon, LogoWordMark } from "@/assets/logo";

import { NAV_LINKS } from "@/data/constants";
import { useSession } from "@/lib/auth/client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <header className="relative h-fit max-md:sticky max-md:top-0 max-md:z-999">
      <div className="container relative z-999 mx-auto max-w-7xl pt-3 md:border-x">
        <nav className="z-999 mx-auto flex items-center gap-4 rounded-xl bg-card p-2.5 font-helvetica shadow-lg max-md:justify-between md:max-w-7xl md:gap-8">
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
          </ul>

          <div className="hidden size-0.5 rounded-full bg-muted-foreground md:block" />

          <div className="flex items-center gap-2 md:gap-4">
            {session ? (
              <Avatar>
                <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                <AvatarImage alt={session.user.name ?? ""} src={session.user.image ?? undefined} />
              </Avatar>
            ) : (
              <Button asChild size="icon" variant="outline">
                <Link href="/auth/login">
                  <IconUser />
                </Link>
              </Button>
            )}
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/current-deal">
                <IconDiamond className="text-brand-500" />
                <span>Claim the Combo</span>
              </Link>
            </Button>

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
        </nav>

        <div className="-left-1.5 pointer-events-none absolute top-1/2 hidden size-2.5 rounded border bg-card md:block" />
        <div className="-right-1.5 pointer-events-none absolute top-1/2 hidden size-2.5 rounded border bg-card md:block" />
      </div>
      <div className="absolute top-1/2 left-0 hidden h-px w-[10%] translate-y-1 bg-border md:block">
        <div className="-right-1.5 -translate-y-1/2 pointer-events-none absolute top-1/2 size-2.5 rounded border bg-card" />
      </div>
      <div className="absolute top-1/2 right-0 hidden h-px w-[10%] translate-y-1 bg-border md:block">
        <div className="-left-1.5 -translate-y-1/2 pointer-events-none absolute top-1/2 size-2.5 rounded border bg-card" />
      </div>
    </header>
  );
};
