import Link from "next/link";

import { LogoIcon } from "@/assets/logo";

import { getSession } from "@/lib/auth/server";
import { CartIcon } from "@/modules/cart/components/cart-icon";
import { getCategoriesWithCount } from "@/modules/categories/actions/query";
import { WishlistIcon } from "@/modules/wishlist/components/wishlist-icon";

import { CategoriesCarousel } from "./categories-carousel";
import { NavigationMenuComponent } from "./navigation-menu";
import { SearchForm } from "./search-form";
import UserMenu from "./user-menu";

export const Navbar = async () => {
  const session = await getSession();
  const categories = await getCategoriesWithCount();

  return (
    <header className="sticky top-0 z-999 h-fit">
      <div className="relative z-999 bg-card/90 text-foreground backdrop-blur-2xl">
        <nav className="container relative z-999 flex items-center justify-between gap-4 py-2.5 font-helvetica max-md:justify-between md:gap-8">
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
            <WishlistIcon />
            <CartIcon />
            <div className="hidden h-5 w-px flex-1 shrink-0 bg-gray-200 md:block" />
            <UserMenu session={session} />
          </div>
        </nav>
        <div className="container border-y">
          <CategoriesCarousel categories={categories} />
        </div>
      </div>
    </header>
  );
};
