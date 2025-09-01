import Link from "next/link";

import { AdminNavbar } from "@/components/layout/admin-navbar";
import { Button } from "@/components/ui/button";

import { isAdmin } from "@/lib/auth/permissions";
import { getProducts } from "@/modules/product/actions/query";
import { ProductsTable } from "@/modules/product/components/table/data-table";

export default async function ProductsUpsertPage() {
  await isAdmin();
  const products = await getProducts();

  return (
    <div className="space-y-4">
      <AdminNavbar>
        <Button asChild size="sm">
          <Link href="/studio/products/create">Add Product</Link>
        </Button>
      </AdminNavbar>
      <div className="container">
        <ProductsTable data={products} />
      </div>
    </div>
  );
}
