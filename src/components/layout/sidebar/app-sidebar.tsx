import * as React from "react";
import { Route } from "next";
import Link from "next/link";

import {
  RiBox1Line,
  RiCouponLine,
  RiDashboardLine,
  RiLogoutBoxLine,
  RiPagesLine,
  RiShoppingCartLine,
  RiUserLine,
} from "@remixicon/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { LogoutButton } from "@/modules/auth/components/logout-button";

import { SidebarLogo } from "./sidebar-logo";

// Admin dashboard navigation data
const data = {
  teams: [
    {
      name: "ZM Deals",
      logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/logo-01_kp2j8x.png",
    },
  ],
  navMain: [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/studio" as const,
          icon: RiDashboardLine,
        },
        {
          title: "Products",
          url: "/studio/products" as const,
          icon: RiPagesLine,
        },
        {
          title: "Combo Deals",
          url: "/studio/products/combo" as const,
          icon: RiBox1Line,
        },
        {
          title: "Categories",
          url: "/studio/products/categories" as const,
          icon: RiPagesLine,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Orders",
          url: "/studio/orders" as const,
          icon: RiShoppingCartLine,
        },
        {
          title: "Users",
          url: "/studio/users" as const,
          icon: RiUserLine,
        },
        {
          title: "Coupons",
          url: "/studio/coupons" as const,
          icon: RiCouponLine,
        },
      ],
    },
    // {
    //   title: "System",
    //   items: [
    //     {
    //       title: "Settings",
    //       url: "/studio/settings" as const,
    //       icon: RiSettings3Line,
    //     },
    //     {
    //       title: "Analytics",
    //       url: "/studio/analytics" as const,
    //       icon: RiBardLine,
    //     },
    //   ],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarLogo />
        <hr className="-mt-px mx-2 border-border border-t" />
        {/* <SearchForm className="mt-3" /> */}
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="text-muted-foreground/60">{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((navItem) => (
                  <SidebarMenuItem key={navItem.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button h-9 gap-3 rounded-md bg-gradient-to-r font-medium hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                      isActive={false}
                    >
                      <Link href={navItem.url as Route}>
                        {navItem.icon && (
                          <navItem.icon
                            aria-hidden="true"
                            className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                            size={18}
                          />
                        )}
                        <span>{navItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <hr className="-mt-px mx-2 border-border border-t" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-9 gap-3 rounded-md bg-gradient-to-r font-medium hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
            >
              <LogoutButton className="w-full">
                <RiLogoutBoxLine
                  aria-hidden="true"
                  className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                  size={22}
                />
                <span>Sign Out</span>
              </LogoutButton>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
