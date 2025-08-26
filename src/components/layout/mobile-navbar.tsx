import Link from "next/link";

import { IconHome } from "@/assets/icons/layout";

export const MobileNavbar = () => {
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t bg-card md:hidden">
      <ul className="flex items-center justify-between gap-2">
        <li>
          <Link className="flex flex-col items-center px-6 py-2.5 text-muted-foreground text-sm" href="/">
            <IconHome className="size-5 text-gray-800" />
            Home
          </Link>
        </li>
        <li>
          <Link className="flex flex-col items-center px-6 py-2.5 text-muted-foreground text-sm" href="/categories">
            <IconHome className="size-5 text-gray-800" />
            Categories
          </Link>
        </li>
        <li>
          <Link className="flex flex-col items-center px-6 py-2.5 text-muted-foreground text-sm" href="/deals">
            <IconHome className="size-5 text-gray-800" />
            Deals
          </Link>
        </li>
        <li>
          <Link className="flex flex-col items-center px-6 py-2.5 text-muted-foreground text-sm" href="/profile">
            <IconHome className="size-5 text-gray-800" />
            Account
          </Link>
        </li>
      </ul>
    </nav>
  );
};
