import Link from "next/link";

import { Button } from "@/components/ui/button";

import { isAdmin } from "@/lib/auth/permissions";
import { getProducts } from "@/modules/product/actions/query";
import { ProductsTable } from "@/modules/product/components/table/data-table";

export default async function ProductsUpsertPage() {
  await isAdmin();
  const products = await getProducts();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Products</h1>
        <Button asChild size="sm">
          <Link href="/studio/products/create">Add Product</Link>
        </Button>
      </div>
      <div>
        <ProductsTable data={products} />
        {/* <pre className="text-wrap text-sm">{JSON.stringify(products, null, 2)}</pre> */}
      </div>
    </div>
  );
}
