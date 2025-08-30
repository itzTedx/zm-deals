"use client";

import { CategoryData } from "../types";
import { CategoryCard } from "./category-card";

interface CategoriesGridProps {
  data: CategoryData[];
}

export function CategoriesGrid({ data }: CategoriesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((category) => (
        <CategoryCard category={category} key={category.id} />
      ))}
    </div>
  );
}
