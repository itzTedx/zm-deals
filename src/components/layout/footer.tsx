import Link from "next/link";

import { FullLogo, Watermark } from "@/assets/logo";

import { FOOTER_LINKS, SOCIALS } from "@/data/constants";

import { Separator, SeparatorBox } from "../ui/separator";

export const Footer = () => {
  return (
    <footer className="relative">
      <Separator />
      <div className="container relative max-w-7xl border-x">
        <div className="flex flex-col items-center gap-4 py-12 md:py-16">
          <FullLogo />
          <h2 className="mx-auto max-w-sm text-center font-medium text-2xl text-muted-foreground md:text-4xl">
            One Deal. Every Week. <span className="text-foreground">Big Savings.</span>
          </h2>
          <ul className="mt-4 flex items-center gap-4">
            {SOCIALS.map(({ icon: Icon, id, href }) => (
              <li key={id}>
                <Link
                  className="flex size-9 items-center justify-center rounded-lg bg-card shadow-lg transition-[background-color_box-shadow] hover:bg-transparent hover:shadow-none"
                  href={href}
                >
                  <Icon />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <SeparatorBox />
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-3 md:py-20 lg:grid-cols-5 lg:gap-9">
          {FOOTER_LINKS.map((footer) => (
            <ul key={footer.heading}>
              <li>
                <h3 className="font-medium">{footer.heading}</h3>
                <ul className="mt-4 space-y-3">
                  {footer.links.map((link) => (
                    <li className="text-muted-foreground" key={link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          ))}
        </div>
        <SeparatorBox />
        <div className="py-12">
          <p className="text-center text-muted-foreground">
            © {new Date().getFullYear()} ZM Deals. All rights reserved.
          </p>
        </div>
        <Watermark className="mx-auto" />
        <div className="-left-1.5 -top-1.5 pointer-events-none absolute z-10 size-2.5 shrink-0 rounded border bg-card" />
        <div className="-right-1.5 -top-1.5 pointer-events-none absolute z-10 size-2.5 shrink-0 rounded border bg-card" />
      </div>
    </footer>
  );
};
