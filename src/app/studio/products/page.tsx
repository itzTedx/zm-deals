import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getProducts } from "@/modules/product/actions/query";
import ContactsTable from "@/modules/product/components/table/data-table";

export default async function ProductsUpsertPage() {
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
        <ContactsTable />
        {/* <pre className="text-wrap text-sm">{JSON.stringify(products, null, 2)}</pre> */}
        {products.map((product) => (
          <div key={product.id}>{product.title}</div>
        ))}
      </div>
    </div>
  );
}
