"use client";

import * as React from "react";
import Image from "next/image";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: string;
  }[];
}) {
  const [activeTeam, _setActiveTeam] = React.useState(teams[0] ?? null);

  if (!teams.length) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="gap-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>svg]:size-auto"
          size="lg"
        >
          <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            {activeTeam && <Image alt={activeTeam.name} height={36} src={activeTeam.logo} width={36} />}
          </div>
          <div className="grid flex-1 text-left text-base leading-tight">
            <span className="truncate font-medium">{activeTeam?.name ?? "Select a Team"}</span>
          </div>
          {/* <RiExpandUpDownLine aria-hidden="true" className="ms-auto text-muted-foreground/60" size={20} /> */}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
