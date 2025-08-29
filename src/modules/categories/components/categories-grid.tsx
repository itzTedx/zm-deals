"use client";

import { CategoryCard } from "./category-card";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    media: {
      url: string | null;
    } | null;
  }>;
  products: Array<{
    id: string;
  }>;
}

interface CategoriesGridProps {
  data: Category[];
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
