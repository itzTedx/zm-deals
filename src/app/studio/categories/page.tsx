import { SeparatorBox } from "@/components/ui/separator";

import { isAdmin } from "@/lib/auth/permissions";
import { getCategoriesWithProductCount } from "@/modules/categories/actions/query";
import { CategoriesTable } from "@/modules/categories/components/categories-table";
import { CategoryModal } from "@/modules/categories/components/model";

export default async function CategoriesPage() {
  await isAdmin();
  const categories = await getCategoriesWithProductCount();

  return (
    <div className="flex w-full flex-col gap-5 py-5">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="font-bold text-2xl">Categories</h1>
            <CategoryModal />
          </div>
          <SeparatorBox />
          <CategoriesTable data={categories} />
        </div>
      </div>
    </div>
  );
}
