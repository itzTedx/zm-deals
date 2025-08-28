import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { IconChevronRight, IconSearch } from "@/assets/icons";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props} className="flex-1">
      <div className="relative mx-auto max-w-sm">
        <Input
          className="peer h-9 ps-9 pe-14 text-sm shadow-lg sm:ps-10 sm:pe-16 sm:text-base"
          id="search"
          placeholder="Search for products..."
          type="search"
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <IconSearch className="size-4 sm:size-5" />
        </div>
        <Button
          aria-label="Submit search"
          className="absolute inset-y-0 end-2 my-auto h-6 bg-card shadow-lg sm:end-3 sm:h-7"
          type="submit"
          variant="outline"
        >
          <IconChevronRight aria-hidden="true" className="size-2.5 sm:size-3" />
        </Button>
      </div>
    </form>
  );
}
