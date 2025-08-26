import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SeparatorBox } from "@/components/ui/separator";

import { isAdmin } from "@/lib/auth/permissions";
import { getCategories } from "@/modules/categories/actions/query";
import { CategoryModal } from "@/modules/categories/components/model";
import { getProducts } from "@/modules/product/actions/query";
import { ProductsTable } from "@/modules/product/components/table/data-table";

export default async function ProductsUpsertPage() {
  await isAdmin();
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="flex w-full flex-col gap-5 py-5">
      <div className="container mx-auto grid grid-cols-[1fr_4fr] gap-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Categories</h2>
            <CategoryModal />
          </div>
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className="font-bold text-lg">{category.name}</h3>
              <p className="text-muted-foreground text-sm">{category.description}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="font-bold text-2xl">Products</h1>
            <Button asChild size="sm">
              <Link href="/studio/products/create">Add Product</Link>
            </Button>
          </div>
          <SeparatorBox />
          <ProductsTable data={products} />
        </div>
      </div>
    </div>
  );
}
