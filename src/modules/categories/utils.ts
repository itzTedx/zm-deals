import { z } from "zod";

import { CategorySchema, categorySchema } from "./schema";
import type {
  CategoryBreadcrumb,
  CategoryData,
  CategoryResponse,
  CategorySortBy,
  CategorySortOrder,
  CategoryStats,
  CategoryValidationResult,
} from "./types";

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validate if a slug is unique (basic validation)
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 50;
}

/**
 * Transform category data for form usage
 */
export function transformCategoryForForm(category: CategoryData): CategorySchema {
  const thumbnailImage = category.images?.find((img) => img.media && img.type === "thumbnail")?.media;
  const bannerImages =
    category.images
      ?.filter((img) => img.media && img.type === "banner")
      .map((img) => img.media)
      .filter(Boolean) || [];

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    thumbnail: thumbnailImage
      ? {
          url: thumbnailImage.url || "",
          key: thumbnailImage.key || "",
          type: "thumbnail",
          width: thumbnailImage.width || undefined,
          height: thumbnailImage.height || undefined,
          blurData: thumbnailImage.blurData || undefined,
        }
      : undefined,
    banners: bannerImages.map((banner) => ({
      url: banner!.url || "",
      key: banner!.key || "",
      type: "banner" as const,
      width: banner!.width || undefined,
      height: banner!.height || undefined,
      blurData: banner!.blurData || undefined,
    })),
  };
}

/**
 * Transform category data for API response
 */
export function transformCategoryForResponse(category: CategoryData): CategoryResponse {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    image: category.images?.[0]?.media || null,
    productCount: category.products?.length || 0,
  };
}

/**
 * Validate category data before submission
 */
export function validateCategoryData(data: unknown): CategoryValidationResult<CategorySchema> {
  try {
    const validatedData = categorySchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError<unknown>;
      return { success: false, error: z.prettifyError(zodError) };
    }
    return { success: false, error: "Invalid category data" };
  }
}

/**
 * Get category statistics
 */
export function getCategoryStats(categories: CategoryData[]): CategoryStats {
  const totalCategories = categories.length;
  const categoriesWithProducts = categories.filter((cat) => (cat.products?.length || 0) > 0).length;
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0);
  const categoriesWithImages = categories.filter((cat) => (cat.images?.length || 0) > 0).length;

  return {
    totalCategories,
    categoriesWithProducts,
    categoriesWithImages,
    totalProducts,
    averageProductsPerCategory: totalCategories > 0 ? (totalProducts / totalCategories).toFixed(1) : "0",
  };
}

/**
 * Sort categories by various criteria
 */
export function sortCategories(
  categories: CategoryData[],
  sortBy: CategorySortBy = "name",
  order: CategorySortOrder = "asc"
): CategoryData[] {
  return [...categories].sort((a, b) => {
    let aValue: string | Date | number;
    let bValue: string | Date | number;

    switch (sortBy) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "createdAt":
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case "productCount":
        aValue = a.products?.length || 0;
        bValue = b.products?.length || 0;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (order === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
  });
}

/**
 * Filter categories by search term
 */
export function filterCategories(categories: CategoryData[], searchTerm: string): CategoryData[] {
  if (!searchTerm.trim()) return categories;

  const term = searchTerm.toLowerCase();
  return categories.filter(
    (category) =>
      category.name.toLowerCase().includes(term) ||
      category.slug.toLowerCase().includes(term) ||
      (category.description && category.description.toLowerCase().includes(term))
  );
}

/**
 * Get category breadcrumb data
 */
export function getCategoryBreadcrumb(category: CategoryData): CategoryBreadcrumb {
  return [
    { label: "Categories", href: "/studio/categories" },
    { label: category.name, href: `/studio/categories/${category.slug}`, current: true },
  ];
}

export function transformCategoryData(category?: CategoryData | null): CategorySchema | undefined {
  if (!category) return undefined;

  const thumbnailImage = category.images?.find((img) => img.media && img.type === "thumbnail")?.media;
  const bannerImages =
    category.images
      ?.filter((img) => img.media && img.type === "banner")
      .map((img) => img.media)
      .filter(Boolean) || [];

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    thumbnail: thumbnailImage
      ? {
          url: thumbnailImage.url || "",
          key: thumbnailImage.key || "",
          type: "thumbnail",
          width: thumbnailImage.width || undefined,
          height: thumbnailImage.height || undefined,
          blurData: thumbnailImage.blurData || undefined,
        }
      : undefined,
    banners: bannerImages.map((banner) => ({
      url: banner!.url || "",
      key: banner!.key || "",
      type: "banner" as const,
      width: banner!.width || undefined,
      height: banner!.height || undefined,
      blurData: banner!.blurData || undefined,
    })),
  };
}
