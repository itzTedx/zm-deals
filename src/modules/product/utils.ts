import { ProductSchema } from "./schema";
import { ProductQueryResult } from "./types";

export function transformProduct(product: ProductQueryResult | null): ProductSchema | null {
  if (!product) return null;

  return {
    id: product.id,
    title: product.title,
    overview: product.overview ?? undefined,
    description: product.description,
    slug: product.slug,

    price: Number(product.price),
    compareAtPrice: Number(product.compareAtPrice) ?? undefined,
    deliveryFee: Number(product.deliveryFee) ?? undefined,
    isDeliveryFree: product.isDeliveryFree ?? true,

    inventory: product.inventory.initialStock,

    images: product.images
      .filter((image) => image.media !== null)
      .map((image) => ({
        url: image.media!.url ?? "",
        isFeatured: image.isFeatured ?? false,
        order: image.sortOrder ?? 0,
        key: image.media!.key ?? undefined,
        width: image.media!.width ?? undefined,
        height: image.media!.height ?? undefined,
        blurData: image.media!.blurData ?? undefined,
      })),

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
    images: [],
    isFeatured: false,
    categoryId: undefined,
    isDeliveryFree: true,

    endsIn: undefined,
    schedule: undefined,
    meta: {
      title: undefined,
      description: undefined,
      keywords: undefined,
    },
  };
}
