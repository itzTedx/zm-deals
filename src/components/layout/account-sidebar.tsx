import Link from "next/link";

import { IconPackage, IconShoppingBag2 } from "@/assets/icons/bag";
import { IconHeart } from "@/assets/icons/heart";
import { IconUser } from "@/assets/icons/user";

import { AuthSession } from "@/lib/auth/server";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
          <Link className="flex items-center gap-2 rounded-md p-2 font-medium" href="/cart">
            <IconShoppingBag2 className="size-5" />
            Cart
          </Link>
        </li>
        <li>
          <Link className="flex items-center gap-2 rounded-md bg-brand-100/50 p-2 font-bold" href="/account/orders">
            <IconPackage className="size-5" />
            Orders
          </Link>
        </li>
        <li>
          <Link className="flex items-center gap-2 rounded-md p-2 font-medium" href="/account/orders">
            <IconHeart className="size-5" />
            Wishlist
          </Link>
        </li>
      </ul>
      <div>
        <h2 className="mb-2 px-3 font-medium text-gray-600 text-xs uppercase">My Account</h2>
        <ul className="space-y-2 rounded-lg bg-card p-2">
          <li>
            <Link className="flex items-center gap-2 rounded-md p-2 font-medium" href="/account/orders">
              <IconUser className="size-5" />
              Profile
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
