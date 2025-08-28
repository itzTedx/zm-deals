import { IconLogout } from "@/assets/icons/auth";
import { IconPackage, IconShoppingBag2 } from "@/assets/icons/bag";
import { IconHeart } from "@/assets/icons/heart";
import { IconUser } from "@/assets/icons/user";

import { AuthSession } from "@/lib/auth/server";
import { LogoutButton } from "@/modules/auth/components/logout-button";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarLink } from "./sidebar/link";

interface Props {
  session: AuthSession;
}

export const AccountSidebar = ({ session }: Props) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-card p-4">
        <div className="flex items-center gap-2">
          <Avatar className="size-12">
            <AvatarFallback>{session?.user.name?.charAt(0)}</AvatarFallback>
            <AvatarImage src={session?.user.image ?? undefined} />
          </Avatar>
          <div>
            <p className="font-medium">{session?.user.name}</p>
            <p className="text-muted-foreground text-xs">{session?.user.email}</p>
          </div>
        </div>
      </div>
      <ul className="space-y-2 rounded-lg bg-card p-2">
        <li>
          <SidebarLink href="/account/cart" icon={<IconShoppingBag2 className="size-5" />}>
            Cart
          </SidebarLink>
        </li>
        <li>
          <SidebarLink href="/account/orders" icon={<IconPackage className="size-5" />}>
            Orders
          </SidebarLink>
        </li>
        <li>
          <SidebarLink href="/account/wishlist" icon={<IconHeart className="size-5" />}>
            Wishlist
          </SidebarLink>
        </li>
      </ul>
      <div>
        <h2 className="mb-2 px-3 font-medium text-gray-600 text-xs uppercase">My Account</h2>
        <ul className="space-y-2 rounded-lg bg-card p-2">
          <li>
            <SidebarLink href="/account" icon={<IconUser className="size-5" />}>
              Profile
            </SidebarLink>
          </li>
        </ul>
      </div>

      <LogoutButton className="flex w-full items-center gap-2 rounded-md bg-card p-4 font-medium">
        <IconLogout className="size-5" />
        Log out
      </LogoutButton>
    </div>
  );
};
