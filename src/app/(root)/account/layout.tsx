import React from "react";

import { AccountSidebar } from "@/components/layout/account-sidebar";

import { getSession } from "@/lib/auth/server";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="container grid gap-9 py-3 md:py-8 lg:grid-cols-[16rem_1fr]">
      <AccountSidebar session={session} />
      {children}
    </div>
  );
}
