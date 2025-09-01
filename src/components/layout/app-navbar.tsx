import Link from "next/link";

import { LogoIcon } from "@/assets/logo";

import { getSession } from "@/lib/auth/server";

import { Button } from "../ui/button";
import UserMenu from "./user-menu";

export const AppNavbar = async () => {
  const session = await getSession();
  if (!session) return null;
  return (
    <nav className="container flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-4">
        <LogoIcon />
        <Button asChild size="sm" variant="outline">
          <Link href="/">Live Website</Link>
        </Button>
      </div>
      {/* <SearchForm /> */}
      <div>
        <UserMenu session={session} />
      </div>
    </nav>
  );
};
