import { LogoIcon } from "@/assets/logo";

import { getSession } from "@/lib/auth/server";

import { SearchForm } from "./sidebar/search-bar";
import UserMenu from "./user-menu";

export const AppNavbar = async () => {
  const session = await getSession();
  if (!session) return null;
  return (
    <nav className="container flex items-center justify-between gap-3 py-2">
      <div>
        <LogoIcon />
      </div>
      <SearchForm />
      <div>
        <UserMenu session={session} />
      </div>
    </nav>
  );
};
