"use server";

import { unstable_cache as cache } from "next/cache";

import { eq } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import { getOrCreateSessionId } from "@/lib/auth/session";
import { db } from "@/server/db";
import { wishlists } from "@/server/schema";

import { WishlistData, WishlistItem } from "../types";
import { getWishlistTag } from "./helper";

export async function getWishlist(): Promise<WishlistItem[]> {
  try {
    const session = await getSession();

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();
      const tag = getWishlistTag({ sessionId });

      const getGuestWishlist = cache(
        async () =>
          db.query.wishlists.findFirst({
            where: eq(wishlists.sessionId, sessionId),
            with: {
              items: {
                with: {
                  product: {
                    with: {
                      category: true,
                      meta: true,
                      inventory: true,
                      images: {
                        with: {
                          media: true,
                        },
                      },
                      reviews: {
                        with: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          }),
        ["wishlist", "guest", sessionId, "full"],
        { tags: [tag] }
      );

      const guestWishlist = await getGuestWishlist();

      if (!guestWishlist || !guestWishlist.items) {
        return [];
      }

      return guestWishlist.items.map((item) => ({
        id: item.id,
        wishlistId: item.wishlistId,
        productId: item.productId,
        addedAt: item.addedAt,
        updatedAt: item.updatedAt,
        product: {
          ...item.product,
          images: item.product.images || [],
          reviews: item.product.reviews || [],
        },
      }));
    }

    // Handle authenticated user wishlist
    const tag = getWishlistTag({ userId: session.user.id });

    const getUserWishlist = cache(
      async () =>
        db.query.wishlists.findFirst({
          where: eq(wishlists.userId, session.user.id),
          with: {
            items: {
              with: {
                product: {
                  with: {
                    category: true,
                    meta: true,
                    inventory: true,
                    images: {
                      with: {
                        media: true,
                      },
                    },
                    reviews: {
                      with: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ["wishlist", "user", session.user.id, "full"],
      { tags: [tag] }
    );

    const userWishlist = await getUserWishlist();

    if (!userWishlist || !userWishlist.items) {
      return [];
    }

    return userWishlist.items.map((item) => ({
      id: item.id,
      wishlistId: item.wishlistId,
      productId: item.productId,
      addedAt: item.addedAt,
      updatedAt: item.updatedAt,
      product: {
        ...item.product,
        images: item.product.images || [],
        reviews: item.product.reviews || [],
      },
    }));
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return [];
  }
}

export async function getWishlistItemCount(): Promise<number> {
  try {
    const session = await getSession();

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();
      const tag = getWishlistTag({ sessionId });

      const getGuestWishlistCount = cache(
        async () =>
          db.query.wishlists.findFirst({
            where: eq(wishlists.sessionId, sessionId),
            with: { items: true },
          }),
        ["wishlist", "guest", sessionId, "count"],
        { tags: [tag] }
      );

      const guestWishlist = await getGuestWishlistCount();

      if (!guestWishlist || !guestWishlist.items) {
        return 0;
      }

      return guestWishlist.items.length;
    }

    // Handle authenticated user wishlist
    const tag = getWishlistTag({ userId: session.user.id });

    const getUserWishlistCount = cache(
      async () =>
        db.query.wishlists.findFirst({
          where: eq(wishlists.userId, session.user.id),
          with: { items: true },
        }),
      ["wishlist", "user", session.user.id, "count"],
      { tags: [tag] }
    );

    const userWishlist = await getUserWishlistCount();

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
    console.log("fetching is in wishlist call");
    const session = await getSession();

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();
      const tag = getWishlistTag({ sessionId });

      const getGuestWishlistIds = cache(
        async () =>
          db.query.wishlists.findFirst({
            where: eq(wishlists.sessionId, sessionId),
            with: {
              items: {
                columns: { productId: true },
              },
            },
          }),
        ["wishlist", "guest", sessionId, "ids"],
        { tags: [tag] }
      );

      const guestWishlist = await getGuestWishlistIds();

      if (!guestWishlist?.items) {
        return false;
      }

      return guestWishlist.items.some((item) => item.productId === productId);
    }

    // Handle authenticated user wishlist
    const tag = getWishlistTag({ userId: session.user.id });

    const getUserWishlistIds = cache(
      async () =>
        db.query.wishlists.findFirst({
          where: eq(wishlists.userId, session.user.id),
          with: {
            items: {
              columns: { productId: true },
            },
          },
        }),
      ["wishlist", "user", session.user.id, "ids"],
      { tags: [tag] }
    );

    const userWishlist = await getUserWishlistIds();

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
    const session = await getSession();

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();
      const tag = getWishlistTag({ sessionId });

      const getGuestWishlistData = cache(
        async () =>
          db.query.wishlists.findFirst({
            where: eq(wishlists.sessionId, sessionId),
            with: {
              items: {
                with: {
                  product: {
                    with: {
                      category: true,
                      meta: true,
                      inventory: true,
                      images: {
                        with: {
                          media: true,
                        },
                      },
                      reviews: {
                        with: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          }),
        ["wishlist", "guest", sessionId, "data"],
        { tags: [tag] }
      );

      const guestWishlist = await getGuestWishlistData();

      if (!guestWishlist || !guestWishlist.items) {
        return {
          items: [],
          itemCount: 0,
        };
      }

      const items: WishlistItem[] = guestWishlist.items.map((item) => ({
        id: item.id,
        wishlistId: item.wishlistId,
        productId: item.productId,
        addedAt: item.addedAt,
        updatedAt: item.updatedAt,
        product: {
          ...item.product,
          images: item.product.images || [],
          reviews: item.product.reviews || [],
        },
      }));

      return {
        items,
        itemCount: items.length,
      };
    }

    // Handle authenticated user wishlist
    const tag = getWishlistTag({ userId: session.user.id });

    const getUserWishlistData = cache(
      async () =>
        db.query.wishlists.findFirst({
          where: eq(wishlists.userId, session.user.id),
          with: {
            items: {
              with: {
                product: {
                  with: {
                    category: true,
                    meta: true,
                    inventory: true,
                    images: {
                      with: {
                        media: true,
                      },
                    },
                    reviews: {
                      with: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ["wishlist", "user", session.user.id, "data"],
      { tags: [tag] }
    );

    const userWishlist = await getUserWishlistData();

    if (!userWishlist || !userWishlist.items) {
      return {
        items: [],
        itemCount: 0,
      };
    }

    const items: WishlistItem[] = userWishlist.items.map((item) => ({
      id: item.id,
      wishlistId: item.wishlistId,
      productId: item.productId,
      addedAt: item.addedAt,
      updatedAt: item.updatedAt,
      product: {
        ...item.product,
        images: item.product.images || [],
        reviews: item.product.reviews || [],
      },
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
