import { getCategories } from "@/modules/categories/actions/query";
import { CategoriesView } from "@/modules/categories/components/categories-view";

export default async function CategoriesAdminPage() {
  const categories = await getCategories();

  return <CategoriesView categories={categories} />;
}
