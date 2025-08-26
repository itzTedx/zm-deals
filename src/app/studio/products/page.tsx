import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SeparatorBox } from "@/components/ui/separator";

import { isAdmin } from "@/lib/auth/permissions";
import { getCategories } from "@/modules/categories/actions/query";
import { CreateButton } from "@/modules/categories/components/create-button";
import { getProducts } from "@/modules/product/actions/query";
import { ProductsTable } from "@/modules/product/components/table/data-table";

export default async function ProductsUpsertPage() {
  await isAdmin();
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="flex w-full flex-col gap-5 py-5">
      <div className="container mx-auto grid grid-cols-5 gap-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Categories</h2>
            <CreateButton />
          </div>
          {categories.map((category) => {
            const image = category.images.media;
            return (
              <div className="flex items-center gap-2" key={category.id}>
                {image && image.url && <Image alt={category.name} height={20} src={image.url} width={20} />}
                <h3 className="font-medium">{category.name}</h3>
              </div>
            );
          })}
        </div>
        <div className="col-span-4 space-y-4">
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
