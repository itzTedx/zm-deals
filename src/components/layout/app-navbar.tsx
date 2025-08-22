import { IconLogout } from "@/assets/icons/auth";
import { LogoIcon } from "@/assets/logo";

import { Button } from "../ui/button";
import { SearchForm } from "./sidebar/search-bar";

export const AppNavbar = () => {
  return (
    <nav className="container flex items-center justify-between gap-3 py-2">
      <div>
        <LogoIcon />
      </div>
      <SearchForm />
      <div>
        <Button size="btn" variant="outline">
          <IconLogout />
        </Button>
      </div>
    </nav>
  );
};
