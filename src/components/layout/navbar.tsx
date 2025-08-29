import Link from "next/link";

import { LogoIcon } from "@/assets/logo";

import { getSession } from "@/lib/auth/server";
import { CartIcon } from "@/modules/cart/components/cart-icon";
import { getCategoriesWithProductCount } from "@/modules/categories/actions/query";
import { WishlistIcon } from "@/modules/wishlist/components/wishlist-icon";

import { Button } from "../ui/button";
import { NavigationMenuComponent } from "./navigation-menu";
import { SearchForm } from "./search-form";
import UserMenu from "./user-menu";

export const Navbar = async () => {
  const session = await getSession();
  const categories = await getCategoriesWithProductCount();

  return (
    <header className="sticky top-0 z-999 h-fit">
      <div className="relative z-999 bg-card text-foreground">
        <nav className="container relative z-999 mx-auto flex max-w-7xl items-center justify-between gap-4 py-2.5 font-helvetica max-md:justify-between md:gap-8">
          <div className="flex items-center gap-2 md:gap-6">
            <Link aria-label="go home" className="flex items-center gap-2" href="/">
              <LogoIcon />
            </Link>
            <div className="hidden size-0.5 rounded-full bg-brand-100 md:block" />
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <NavigationMenuComponent categories={categories} />
            </div>
          </div>

          <div className="mx-auto max-w-sm flex-1 sm:max-w-md">
            <SearchForm />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {session ? (
              <UserMenu session={session} />
            ) : (
              <Button asChild className="text-muted-foreground" variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
            )}
            {/* {session && !session.user.isAnonymous ? (
              <UserMenu session={session} />
            ) : (
              <Button asChild className="text-muted-foreground" variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
            )} */}
            <div className="hidden h-5 w-px flex-1 shrink-0 bg-gray-200 md:block" />
            <WishlistIcon />
            <CartIcon />
          </div>
        </nav>
      </div>
    </header>
  );
};
