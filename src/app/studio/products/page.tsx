import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SeparatorBox } from "@/components/ui/separator";

import { isAdmin } from "@/lib/auth/permissions";
import { getProducts } from "@/modules/product/actions/query";
import { ProductsTable } from "@/modules/product/components/table/data-table";

import { CategoryModal } from "./category/model";

export default async function ProductsUpsertPage() {
  await isAdmin();
  const products = await getProducts();
  return (
    <div className="flex w-full flex-col gap-5 py-5">
      <div className="container mx-auto grid grid-cols-[1fr_4fr] gap-4">
        <div className="flex w-full flex-col gap-4">
          <h2 className="font-bold text-lg">Categories</h2>
          <CategoryModal />
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
