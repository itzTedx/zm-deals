import Link from "next/link";

import { Plus } from "lucide-react";

import { AdminNavbar } from "@/components/layout/admin-navbar";
import { Button } from "@/components/ui/button";

import { isAdmin } from "@/lib/auth/permissions";
import { getComboDeals } from "@/modules/combo-deals/actions/query";
import { ComboDealsDataTable } from "@/modules/combo-deals/components/data-table";

export default async function ComboAdminPage() {
  await isAdmin();
  const comboDeals = await getComboDeals();

  return (
    <div className="space-y-4">
      <AdminNavbar>
        <Button asChild size="sm">
          <Link href="/studio/products/combo/create">
            <Plus className="size-4" />
            Add Combo Deal
          </Link>
        </Button>
      </AdminNavbar>
      <div className="container">
        <ComboDealsDataTable data={comboDeals} />
      </div>
    </div>
  );
}
