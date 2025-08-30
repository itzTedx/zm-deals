"use client";

import * as React from "react";
import type { Route } from "next";
import Image from "next/image";
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

import { Category, CategoryImage, Media } from "@/server/schema";

interface Props {
  categories: Array<Category & { images: Array<CategoryImage & { media: Media | null }> }>;
}

export function NavigationMenuComponent({ categories }: Props) {
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
            <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-4 lg:w-[780px]">
              {categories.map((category) => (
                <ListItem href={`/categories/${category.slug}`} key={category.id} title={category.name}>
                  {/* {category.description || `Browse ${category.name.toLowerCase()} deals`} */}
                  <Image
                    alt={category.name}
                    className="rounded-md"
                    height={80}
                    src={category.images.find((image) => image.media)?.media?.url ?? ""}
                    width={80}
                  />
                </ListItem>
              ))}

              <ListItem href="/categories" title="View All Categories" />
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
        <Link className="flex flex-col items-center justify-center" href={href as Route}>
          {children}
          <p className="text-center font-medium text-sm leading-none">{title}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
