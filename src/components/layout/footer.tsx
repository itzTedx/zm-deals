import Link from "next/link";

import { FullLogo, Watermark } from "@/assets/logo";

import { FOOTER_LINKS, SOCIALS } from "@/data/constants";

import { Separator, SeparatorBox } from "../ui/separator";

export const Footer = () => {
  return (
    <footer className="relative">
      <Separator />
      <div className="container relative max-w-7xl border-x">
        <div className="flex flex-col items-center gap-6 py-8 sm:gap-4 sm:py-12">
          <FullLogo />
          <h2 className="mx-auto max-w-xs text-center font-medium text-muted-foreground text-xl sm:max-w-sm sm:text-2xl md:text-4xl">
            One Deal. Every Week. <span className="text-foreground">Big Savings.</span>
          </h2>
          <ul className="mt-2 flex items-center gap-3 sm:mt-4 sm:gap-4">
            {SOCIALS.map(({ icon: Icon, id, href }) => (
              <li key={id}>
                <Link
                  className="flex size-8 items-center justify-center rounded-lg bg-card text-gray-400 shadow-lg transition-[background-color_box-shadow_color] hover:bg-transparent hover:text-gray-700 hover:shadow-none sm:size-9"
                  href={href}
                >
                  <Icon />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <SeparatorBox />
        <div className="grid grid-cols-2 gap-6 py-8 sm:gap-8 sm:py-12 md:grid-cols-3 md:py-20 lg:grid-cols-5 lg:gap-9">
          {FOOTER_LINKS.map((footer) => (
            <ul key={footer.heading}>
              <li>
                <h3 className="font-medium text-sm sm:text-base">{footer.heading}</h3>
                <ul className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                  {footer.links.map((link) => (
                    <li className="text-muted-foreground text-xs sm:text-sm" key={link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          ))}
        </div>
        <SeparatorBox />
        <div className="py-8 sm:py-12">
          <p className="text-center text-muted-foreground text-xs sm:text-sm">
            © {new Date().getFullYear()} ZM Deals. All rights reserved.
          </p>
        </div>
        <Watermark className="mx-auto mb-0 w-full md:w-auto" />
        <div className="-left-1.5 -top-1.5 pointer-events-none absolute z-10 size-2.5 shrink-0 rounded border bg-card" />
        <div className="-right-1.5 -top-1.5 pointer-events-none absolute z-10 size-2.5 shrink-0 rounded border bg-card" />
      </div>
    </footer>
  );
};
