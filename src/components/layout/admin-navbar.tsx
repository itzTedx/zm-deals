"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface Props {
  children: React.ReactNode;
  currentPage?: string;
}

// Map route segments to display names
const routeNameMap: Record<string, string> = {
  studio: "Studio",
  products: "Products",
  orders: "Orders",
  users: "Users",
  coupons: "Coupons",
  categories: "Categories",
  create: "Create",
  edit: "Edit",
  dashboard: "Dashboard",
  analytics: "Analytics",
  settings: "Settings",
  profile: "Profile",
  inventory: "Inventory",
  shipping: "Shipping",
  pricing: "Pricing",
  meta: "Meta",
  scheduling: "Scheduling",
  classification: "Classification",
};

interface BreadcrumbItem {
  label: string;
  href: Route;
  isCurrent: boolean;
}

// Generate breadcrumb items from pathname
function generateBreadcrumbs(pathname: string, currentPage?: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Studio
  breadcrumbs.push({
    label: "Studio",
    href: "/studio" as Route,
    isCurrent: segments.length === 1,
  });

  // Build breadcrumb items from path segments
  let currentPath = "/studio";
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip numeric IDs, UUIDs, and special segments
    const isNumericId = /^\d+$/.test(segment);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    const hasSpecialChars = ["[", "]", "(", ")"].some((char) => segment.includes(char));

    if (!isNumericId && !isUuid && !hasSpecialChars) {
      const label = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      breadcrumbs.push({
        label,
        href: currentPath as Route,
        isCurrent: i === segments.length - 1 && !currentPage,
      });
    }
  }

  // Add custom current page if provided
  if (currentPage) {
    breadcrumbs.push({
      label: currentPage,
      href: pathname as Route,
      isCurrent: true,
    });
  }

  return breadcrumbs;
}

export const AdminNavbar = ({ children, currentPage }: Props) => {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname, currentPage);

  return (
    <div className="sticky top-0 z-999 w-full border-b bg-card p-2.5">
      <div className="container flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <SidebarTrigger />
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs.map((breadcrumb, index) => (
              <BreadcrumbItem key={breadcrumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                {breadcrumb.isCurrent ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {children}
      </div>
    </div>
  );
};
