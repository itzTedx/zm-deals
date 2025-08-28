"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount?: number;
  images: Array<{
    media: {
      url: string | null;
    } | null;
  }>;
}

interface NavigationMenuComponentProps {
  categories: Category[];
}

export function NavigationMenuComponent({ categories }: NavigationMenuComponentProps) {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="gap-2">
        {/* Home Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link className="font-medium text-gray-600 transition-colors hover:text-brand-500" href="/">
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Deals Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link className="font-medium text-gray-600 transition-colors hover:text-brand-500" href="/deals">
              Deals
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Categories Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="font-medium text-gray-600 transition-colors hover:text-brand-500 data-[state=open]:text-brand-500">
            <Link className="font-medium text-gray-600 transition-colors hover:text-brand-500" href="/categories">
              Categories
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {categories.map((category) => (
                <ListItem href={`/categories/${category.slug}`} key={category.id} title={category.name}>
                  {category.description || `Browse ${category.name.toLowerCase()} deals`}
                </ListItem>
              ))}
              <ListItem href="/categories" title="View All Categories">
                Explore all product categories and find the best deals
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href as Route}>
          <div className="font-medium text-sm leading-none">{title}</div>
          <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
