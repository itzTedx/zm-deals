"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { getOrCreateSessionId } from "@/lib/auth/session";
import { db } from "@/server/db";
import { wishlists } from "@/server/schema";

import { WishlistData, WishlistItem } from "../types";

export async function getWishlist(): Promise<WishlistItem[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();

      const guestWishlist = await db.query.wishlists.findFirst({
        where: eq(wishlists.sessionId, sessionId),
        with: {
          items: {
            with: {
              product: {
                with: {
                  meta: true,
                  inventory: true,
                  images: {
                    with: {
                      media: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!guestWishlist || !guestWishlist.items) {
        return [];
      }

      return guestWishlist.items.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          image: item.product.image,
          slug: item.product.slug,
          meta: item.product.meta
            ? {
                metaTitle: item.product.meta.metaTitle || undefined,
                metaDescription: item.product.meta.metaDescription || undefined,
              }
            : undefined,
          inventory: item.product.inventory
            ? {
                stock: item.product.inventory.stock,
                isOutOfStock: item.product.inventory.isOutOfStock,
              }
            : undefined,
          images:
            item.product.images
              ?.filter((img) => img.media?.url && img.media?.alt)
              .map((img) => ({
                media: {
                  url: img.media!.url,
                  alt: img.media!.alt,
                },
              })) || undefined,
        },
        addedAt: item.addedAt,
      }));
    }

    // Handle authenticated user wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
      with: {
        items: {
          with: {
            product: {
              with: {
                meta: true,
                inventory: true,
                images: {
                  with: {
                    media: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWishlist || !userWishlist.items) {
      return [];
    }

    return userWishlist.items.map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        image: item.product.image,
        slug: item.product.slug,
        meta: item.product.meta
          ? {
              metaTitle: item.product.meta.metaTitle || undefined,
              metaDescription: item.product.meta.metaDescription || undefined,
            }
          : undefined,
        inventory: item.product.inventory
          ? {
              stock: item.product.inventory.stock,
              isOutOfStock: item.product.inventory.isOutOfStock,
            }
          : undefined,
        images:
          item.product.images
            ?.filter((img) => img.media?.url && img.media?.alt)
            .map((img) => ({
              media: {
                url: img.media!.url,
                alt: img.media!.alt,
              },
            })) || undefined,
      },
      addedAt: item.addedAt,
    }));
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return [];
  }
}

export async function getWishlistItemCount(): Promise<number> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();

      const guestWishlist = await db.query.wishlists.findFirst({
        where: eq(wishlists.sessionId, sessionId),
        with: {
          items: true,
        },
      });

      if (!guestWishlist || !guestWishlist.items) {
        return 0;
      }

      return guestWishlist.items.length;
    }

    // Handle authenticated user wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
      with: {
        items: true,
      },
    });

    if (!userWishlist || !userWishlist.items) {
      return 0;
    }

    return userWishlist.items.length;
  } catch (error) {
    console.error("Error getting wishlist item count:", error);
    return 0;
  }
}

export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();

      const guestWishlist = await db.query.wishlists.findFirst({
        where: eq(wishlists.sessionId, sessionId),
        with: {
          items: true,
        },
      });

      if (!guestWishlist?.items) {
        return false;
      }

      return guestWishlist.items.some((item) => item.productId === productId);
    }

    // Handle authenticated user wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
      with: {
        items: true,
      },
    });

    if (!userWishlist?.items) {
      return false;
    }

    return userWishlist.items.some((item) => item.productId === productId);
  } catch (error) {
    console.error("Error checking if product is in wishlist:", error);
    return false;
  }
}

export async function getWishlistData(): Promise<WishlistData> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();

      const guestWishlist = await db.query.wishlists.findFirst({
        where: eq(wishlists.sessionId, sessionId),
        with: {
          items: {
            with: {
              product: {
                with: {
                  meta: true,
                  inventory: true,
                  images: {
                    with: {
                      media: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!guestWishlist || !guestWishlist.items) {
        return {
          items: [],
          itemCount: 0,
        };
      }

      const items = guestWishlist.items.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          image: item.product.image,
          slug: item.product.slug,
          meta: item.product.meta
            ? {
                metaTitle: item.product.meta.metaTitle || undefined,
                metaDescription: item.product.meta.metaDescription || undefined,
              }
            : undefined,
          inventory: item.product.inventory
            ? {
                stock: item.product.inventory.stock,
                isOutOfStock: item.product.inventory.isOutOfStock,
              }
            : undefined,
          images:
            item.product.images
              ?.filter((img) => img.media?.url && img.media?.alt)
              .map((img) => ({
                media: {
                  url: img.media!.url,
                  alt: img.media!.alt,
                },
              })) || undefined,
        },
        addedAt: item.addedAt,
      }));

      return {
        items,
        itemCount: items.length,
      };
    }

    // Handle authenticated user wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
      with: {
        items: {
          with: {
            product: {
              with: {
                meta: true,
                inventory: true,
                images: {
                  with: {
                    media: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWishlist || !userWishlist.items) {
      return {
        items: [],
        itemCount: 0,
      };
    }

    const items = userWishlist.items.map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        image: item.product.image,
        slug: item.product.slug,
        meta: item.product.meta
          ? {
              metaTitle: item.product.meta.metaTitle || undefined,
              metaDescription: item.product.meta.metaDescription || undefined,
            }
          : undefined,
        inventory: item.product.inventory
          ? {
              stock: item.product.inventory.stock,
              isOutOfStock: item.product.inventory.isOutOfStock,
            }
          : undefined,
        images:
          item.product.images
            ?.filter((img) => img.media?.url && img.media?.alt)
            .map((img) => ({
              media: {
                url: img.media!.url,
                alt: img.media!.alt,
              },
            })) || undefined,
      },
      addedAt: item.addedAt,
    }));

    return {
      items,
      itemCount: items.length,
    };
  } catch (error) {
    console.error("Error getting wishlist data:", error);
    return {
      items: [],
      itemCount: 0,
    };
  }
}
