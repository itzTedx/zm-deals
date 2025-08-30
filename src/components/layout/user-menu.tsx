"use client";

import Link from "next/link";

import { IconLogout, IconPackage, IconUser } from "@/assets/icons";

import { useIsMobile } from "@/hooks/use-mobile";
import { AuthSession } from "@/lib/auth/server";
import { LogoutButton } from "@/modules/auth/components/logout-button";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function UserMenu({ session }: { session: AuthSession }) {
  const isMobile = useIsMobile();

  if (!session) {
    return (
      <Button asChild className="text-muted-foreground" variant="outline">
        <Link href="/auth/login">Login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2">
        <Avatar>
          <AvatarImage alt="Profile image" src={session.user.image ?? undefined} />
          <AvatarFallback className="text-muted-foreground">{session.user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        {/* <div className="hidden flex-col items-start md:flex">
          <p className="font-medium text-gray-600 text-sm">Hi! {session.user.name}</p>
          <p className="text-muted/80 text-xs">{session.user.email}</p>
        </div> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isMobile ? "end" : "center"} className="z-99999 max-w-72">
        <DropdownMenuLabel className="flex min-w-0 items-center gap-1.5">
          <Avatar className="size-11 rounded-sm">
            <AvatarImage alt="Profile image" src={session.user.image ?? undefined} />
            <AvatarFallback className="rounded-sm">{session.user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="truncate font-medium text-foreground text-sm">{session.user.name}</span>
            <span className="flex items-center truncate font-normal text-muted-foreground text-xs">
              {session.user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link className="block cursor-pointer" href="/account/orders">
            <DropdownMenuItem>
              <IconPackage aria-hidden="true" className="opacity-60" />
              <span>My Orders</span>
            </DropdownMenuItem>
          </Link>
          <Link className="block cursor-pointer" href="/account/wishlist">
            <DropdownMenuItem>
              <IconUser aria-hidden="true" className="opacity-60" />
              <span>Wishlist</span>
            </DropdownMenuItem>
          </Link>
          <Link className="block cursor-pointer" href="/account/profile">
            <DropdownMenuItem>
              <IconUser aria-hidden="true" className="opacity-60" />
              <span> Profile</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogoutButton>
            <IconLogout aria-hidden="true" className="opacity-60" />
            <span>Logout</span>
          </LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
