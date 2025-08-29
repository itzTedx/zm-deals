import type { Category, CategoryImage } from "@/server/schema/categories-schema";
import type { Media } from "@/server/schema/media-schema";

// Type for category with relations (from Drizzle query)
export type CategoryWithRelations = Category & {
  images?: Array<
    CategoryImage & {
      media: Media | null;
    }
  >;
  products?: Array<{ id: string; title: string; slug: string; status: string }>;
};

// Type for category data used in transformations
export type CategoryData = CategoryWithRelations;

// Type for category response data
export type CategoryResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  image: Media | null;
  productCount: number;
};

// Type for category statistics
export type CategoryStats = {
  totalCategories: number;
  categoriesWithProducts: number;
  categoriesWithImages: number;
  totalProducts: number;
  averageProductsPerCategory: string;
};

// Type for category breadcrumb
export type CategoryBreadcrumb = Array<{
  label: string;
  href: string;
  current?: boolean;
}>;

// Type for category sort options
export type CategorySortBy = "name" | "createdAt" | "productCount";
export type CategorySortOrder = "asc" | "desc";

// Type for category filter options
export type CategoryFilters = {
  search?: string;
  sortBy?: CategorySortBy;
  sortOrder?: CategorySortOrder;
};

// Type for category validation result
export type CategoryValidationResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
