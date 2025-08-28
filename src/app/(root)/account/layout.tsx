import React from "react";

import { AccountSidebar } from "@/components/layout/account-sidebar";

import { getSession } from "@/lib/auth/server";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="container grid grid-cols-[20rem_1fr] gap-9 py-8">
      <AccountSidebar session={session} />
      {children}
    </div>
  );
}
