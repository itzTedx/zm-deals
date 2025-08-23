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
    images: [
      { url: "/images/vacuum-holder.webp", order: 1, isFeatured: true },
      { url: "/images/car-umbrella.webp", order: 2, isFeatured: false },
      { url: "/images/combo.webp", order: 3, isFeatured: false },
      { url: "/images/usb-c-car-charger.webp", order: 4, isFeatured: false },
      { url: "/images/vacuum-1.webp", order: 5, isFeatured: false },
      { url: "/images/vacuum-2.webp", order: 6, isFeatured: false },
      { url: "/images/vacuum-3.webp", order: 7, isFeatured: false },
      { url: "/images/vacuum-holder-1.jpg", order: 8, isFeatured: false },
    ],
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
