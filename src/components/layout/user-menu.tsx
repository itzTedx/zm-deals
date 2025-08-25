"use client";

import Link from "next/link";

import { IconLogout } from "@/assets/icons/auth";
import { IconUser } from "@/assets/icons/user";

import { AuthSession } from "@/lib/auth/server";
import { LogoutButton } from "@/modules/auth/components/logout-button";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import GlareHover from "../ui/glare-hover";

export default function UserMenu({ session }: { session: NonNullable<AuthSession> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer gap-2">
        <Avatar>
          <GlareHover className="size-full rounded-md">
            <AvatarImage alt="Profile image" src={session.user.image ?? undefined} />
            <AvatarFallback className="text-muted-foreground">{session.user.name.slice(0, 1)}</AvatarFallback>
          </GlareHover>
        </Avatar>
        <div className="hidden flex-col items-start md:flex">
          <p className="font-medium text-sm">Hi! {session.user.name}</p>
          <p className="text-muted/80 text-xs">{session.user.email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-99999 max-w-72">
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
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/profile">
              <IconUser aria-hidden="true" className="opacity-60" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/profile">
              <IconUser aria-hidden="true" className="opacity-60" />
              <span>Wishlist</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/profile">
              <IconUser aria-hidden="true" className="opacity-60" />
              <span> Profile</span>
            </Link>
          </DropdownMenuItem>
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
