import { getCategory } from "@/modules/categories/actions/query";
import { CategoryForm } from "@/modules/categories/components/form/category-form";
import { transformCategoryData } from "@/modules/categories/utils";

type Params = Promise<{ id: string }>;

export default async function CategoryUpsertPage({ params }: { params: Params }) {
  const { id } = await params;
  const category = await getCategory(id);
  const isEdit = !!category;

  return <CategoryForm initialData={transformCategoryData(category)} isEdit={isEdit} />;
}
