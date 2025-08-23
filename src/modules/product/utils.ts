import { ProductSchema } from "./schema";
import { ProductQueryResult } from "./types";

export function transformProduct(product: ProductQueryResult | null): ProductSchema | null {
  if (!product) return null;

  return {
    title: product.title,
    overview: product.overview ?? undefined,
    description: product.description,
    slug: product.slug,

    price: Number(product.price),
    compareAtPrice: Number(product.compareAtPrice) ?? undefined,
    inventory: product.inventory.initialStock,

    images: [{ url: product.image, isFeatured: true, order: 1 }],

    meta: {
      title: product.meta?.metaTitle ?? undefined,
      description: product.meta?.metaDescription ?? undefined,
      keywords: undefined,
    },

    isFeatured: product.isFeatured,
    endsIn: product.endsIn ?? undefined,
    schedule: product.schedule ?? undefined,
  };
}

export function getInitialValues(): ProductSchema {
  return {
    title: "",
    description: "",
    overview: "",
    slug: "",
    price: 0,
    compareAtPrice: undefined,
    inventory: 0,
    images: [{ url: "/images/vacuum-holder.webp", isFeatured: true, order: 1 }],
    isFeatured: false,
    endsIn: undefined,
    schedule: undefined,
    meta: {
      title: undefined,
      description: undefined,
      keywords: undefined,
    },
  };
}
