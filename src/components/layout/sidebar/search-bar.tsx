import { useId } from "react";

import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar";

import { IconSearch } from "@/assets/icons/search";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const id = useId();

  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <div className="relative">
            <SidebarInput aria-label="Search" className="ps-9 pe-9" id={id} />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/60 peer-disabled:opacity-50">
              <IconSearch aria-hidden="true" className="shrink-0 text-gray-400" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
              <kbd className="inline-flex size-5 max-h-full items-center justify-center rounded bg-input px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                /
              </kbd>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
