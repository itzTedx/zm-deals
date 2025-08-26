import Link from "next/link";

import { IconPackage } from "@/assets/icons/bag";
import { IconDiamond } from "@/assets/icons/diamonds";
import { IconCategories, IconHome } from "@/assets/icons/layout";
import { IconUser } from "@/assets/icons/user";

import { getSession } from "@/lib/auth/server";

export const MobileNavbar = async () => {
  const session = await getSession();
  const isLoggedIn = !!session && !session.user.isAnonymous;
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
            <IconCategories className="size-5 text-gray-800" />
            Categories
          </Link>
        </li>
        <li>
          <Link className="flex flex-col items-center px-6 py-2.5 text-muted-foreground text-sm" href="/deals">
            <IconDiamond className="size-5 text-gray-800" />
            Deals
          </Link>
        </li>
        <li>
          {isLoggedIn ? (
            <Link className="flex flex-col items-center px-6 py-2.5 text-muted-foreground text-sm" href="/orders">
              <IconPackage className="size-5 text-gray-800" />
              Orders
            </Link>
          ) : (
            <Link className="flex flex-col items-center px-6 py-2.5 text-muted-foreground text-sm" href="/auth/login">
              <IconUser className="size-5 text-gray-800" />
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};
