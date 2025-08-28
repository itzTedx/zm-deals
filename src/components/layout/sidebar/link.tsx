"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface Props {
  href: Route;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SidebarLink = ({ href, icon, children, className }: Props) => {
  const pathname = usePathname();
  const isActive = pathname.includes(href);

  return (
    <Link
      className={cn("flex items-center gap-2 rounded-md p-2 font-medium", isActive && "bg-brand-100/50", className)}
      href={href}
    >
      {icon}
      {children}
    </Link>
  );
};
