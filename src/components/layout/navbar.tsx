import Link from "next/link";

import { IconDiamond } from "@/assets/icons/diamonds";
import { IconUser } from "@/assets/icons/user";
import { LogoIcon } from "@/assets/logo";

import { NAV_LINKS } from "@/data/constants";

import { Button } from "../ui/button";

export const Navbar = () => {
  return (
    <header className="relative h-fit">
      <div className="container relative z-999 mx-auto max-w-7xl border-x pt-3">
        <nav className="z-999 mx-auto flex max-w-fit items-center gap-8 rounded-xl bg-card p-2.5 font-helvetica shadow-lg">
          <Link aria-label="go home" href="/">
            <LogoIcon />
          </Link>
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((nav) => (
              <li key={nav.href}>
                <Link href={nav.href}>{nav.label}</Link>
              </li>
            ))}
          </ul>
          <div className="size-0.5 rounded-full bg-muted-foreground" />
          <div className="flex items-center gap-4">
            <Button size="icon" variant="outline">
              <IconUser />
            </Button>
            <Button>
              <IconDiamond className="text-brand-500" />
              <span>Claim the Deal</span>
            </Button>
          </div>
        </nav>
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
