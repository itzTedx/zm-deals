import React, { Suspense } from "react";

import { ProductSidebar } from "@/components/layout/sidebar/product-sidebar";

import { CategoryModal } from "@/modules/categories/components/model";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container relative grid gap-6 pt-4 md:grid-cols-[14rem_1fr]">
      <ProductSidebar />
      {children}
      <Suspense>
        <CategoryModal />
      </Suspense>
    </main>
  );
}
