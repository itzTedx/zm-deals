import { Suspense } from "react";

import { getCategories } from "@/modules/categories/actions/query";
import { CategoriesView } from "@/modules/categories/components/categories-view";

export default async function CategoriesAdminPage() {
  const categories = await getCategories();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoriesView categories={categories} />
    </Suspense>
  );
}
