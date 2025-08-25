import { isAdmin } from "@/lib/auth/permissions";
import { getProduct } from "@/modules/product/actions/query";
import { ProductForm } from "@/modules/product/components/form/product-form";
import { transformProduct } from "@/modules/product/utils";

type Params = Promise<{ id: string }>;

export default async function ProductPage({ params }: { params: Params }) {
  await isAdmin();
  const { id } = await params;

  const isEditMode = id !== "create";

  const product = await getProduct(id);

  return <ProductForm initialData={transformProduct(product)} isEditMode={isEditMode} />;
}
