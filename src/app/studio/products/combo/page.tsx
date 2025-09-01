import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SeparatorBox } from "@/components/ui/separator";

import { isAdmin } from "@/lib/auth/permissions";
import { getComboDeals } from "@/modules/combo-deals/actions/query";
import { ComboDealsDataTable } from "@/modules/combo-deals/components/data-table";

export default async function ComboAdminPage() {
  await isAdmin();
  const comboDeals = await getComboDeals();

  return (
    <div className="container space-y-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="font-bold text-2xl">Combo Deals</h1>
        <Button asChild size="sm">
          <Link href="/studio/products/combo/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Combo Deal
          </Link>
        </Button>
      </div>
      <SeparatorBox />
      <ComboDealsDataTable data={comboDeals} />
    </div>
  );
}
