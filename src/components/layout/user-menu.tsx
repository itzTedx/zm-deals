"use client";

import Link from "next/link";

import { IconLogout } from "@/assets/icons/auth";
import { IconUser } from "@/assets/icons/user";

import { useSession } from "@/lib/auth/client";
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

export default function UserMenu() {
  const { data } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full">
        <Avatar>
          <GlareHover className="size-full rounded-md">
            <AvatarImage alt="Profile image" src={data?.user.image ?? undefined} />
            <AvatarFallback>{data?.user.name.slice(0, 1)}</AvatarFallback>
          </GlareHover>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-99999 max-w-72">
        <DropdownMenuLabel className="flex min-w-0 items-center gap-1.5">
          <Avatar className="size-11 rounded-sm">
            <AvatarImage alt="Profile image" src={data?.user.image ?? undefined} />
            <AvatarFallback className="rounded-sm">{data?.user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="truncate font-medium text-foreground text-sm">{data?.user.name}</span>
            <span className="flex items-center truncate font-normal text-muted-foreground text-xs">
              {data?.user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/settings/profile">
              <IconUser aria-hidden="true" className="opacity-60" />
              <span>Edit Profile</span>
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
