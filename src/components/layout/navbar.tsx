"use client";

import { useState } from "react";
import Link from "next/link";

import { IconDiamond } from "@/assets/icons/diamonds";
import { IconMenu, IconX } from "@/assets/icons/menu";
import { IconUser } from "@/assets/icons/user";
import { LogoIcon } from "@/assets/logo";

import { NAV_LINKS } from "@/data/constants";

import { Button } from "../ui/button";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative h-fit">
      <div className="container relative z-999 mx-auto max-w-7xl border-x pt-3">
        <nav className="z-999 mx-auto flex max-w-fit items-center gap-4 rounded-xl bg-card p-2.5 font-helvetica shadow-lg md:gap-8">
          <Link aria-label="go home" href="/">
            <LogoIcon />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((nav) => (
              <li key={nav.href}>
                <Link href={nav.href}>{nav.label}</Link>
              </li>
            ))}
          </ul>

          <div className="hidden size-0.5 rounded-full bg-muted-foreground md:block" />

          <div className="flex items-center gap-2 md:gap-4">
            <Button className="hidden sm:flex" size="icon" variant="outline">
              <IconUser />
            </Button>
            <Button className="hidden sm:flex">
              <IconDiamond className="text-brand-500" />
              <span>Claim the Deal</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} size="icon" variant="outline">
              {isMenuOpen ? <IconX className="size-5" /> : <IconMenu className="size-5" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-xl bg-card p-4 shadow-lg md:hidden">
            <div className="flex flex-col gap-4">
              {/* Mobile Navigation */}
              <ul className="flex flex-col gap-3">
                {NAV_LINKS.map((nav) => (
                  <li key={nav.href}>
                    <Link
                      className="block py-2 font-medium text-lg transition-colors hover:text-brand-500"
                      href={nav.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {nav.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-4">
                <div className="flex flex-col gap-3">
                  <Button className="w-full justify-start" variant="outline">
                    <IconUser className="mr-2" />
                    <span>Sign In</span>
                  </Button>
                  <Button className="w-full justify-start">
                    <IconDiamond className="mr-2 text-brand-500" />
                    <span>Claim the Deal</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="-left-1.5 pointer-events-none absolute top-1/2 size-2.5 rounded border bg-card" />
        <div className="-right-1.5 pointer-events-none absolute top-1/2 size-2.5 rounded border bg-card" />
      </div>
      <div className="absolute top-1/2 left-0 h-px w-1/4 translate-y-1 bg-border">
        <div className="-right-1.5 -translate-y-1/2 pointer-events-none absolute top-1/2 size-2.5 rounded border bg-card" />
      </div>
      <div className="absolute top-1/2 right-0 h-px w-1/4 translate-y-1 bg-border">
        <div className="-left-1.5 -translate-y-1/2 pointer-events-none absolute top-1/2 size-2.5 rounded border bg-card" />
      </div>
    </header>
  );
};
