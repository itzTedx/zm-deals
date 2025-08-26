import React from "react";

import { CategoryModal } from "@/modules/categories/components/model";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CategoryModal />
    </>
  );
}
