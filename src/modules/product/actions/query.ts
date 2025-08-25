"use server";

import { and, desc, eq, isNull } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import { db } from "@/server/db";
import { products, reviews } from "@/server/schema";

export async function getProducts() {
  const products = await db.query.products.findMany({
    with: {
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
  });

  return products;
}

export async function getProduct(id: string) {
  if (id === "create") return null;

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
    },
  });

  if (!product) return null;

  return product;
}

export async function getProductBySlug(slug: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      meta: true,
      inventory: true,
      reviews: {
        where: isNull(reviews.deletedAt),
        with: {
          user: true,
        },
        orderBy: [desc(reviews.createdAt)],
      },
      images: {
        with: {
          media: true,
        },
      },
    },
  });

  return product;
}

export async function getFeaturedProducts() {
  const [res] = await db.query.products.findMany({
    where: eq(products.isFeatured, true),
    limit: 1,
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
    },
  });

  return res;
}

export async function getProductReviews(productId: string, limit?: number) {
  if (limit) {
    return await db.query.reviews.findMany({
      where: and(eq(reviews.productId, productId), isNull(reviews.deletedAt)),
      with: {
        user: true,
      },
      orderBy: [desc(reviews.createdAt)],
      limit,
    });
  }

  return await db.query.reviews.findMany({
    where: and(eq(reviews.productId, productId), isNull(reviews.deletedAt)),
    with: {
      user: true,
    },
    orderBy: [desc(reviews.createdAt)],
  });
}

export async function getUserReview(productId: string, userId: string) {
  const review = await db.query.reviews.findFirst({
    where: and(eq(reviews.productId, productId), eq(reviews.userId, userId), isNull(reviews.deletedAt)),
    with: {
      user: true,
    },
  });

  return review;
}

export async function getReviewStats(productId: string) {
  const allReviews = await db.query.reviews.findMany({
    where: and(eq(reviews.productId, productId), isNull(reviews.deletedAt)),
    columns: {
      rating: true,
    },
  });

  if (allReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }

  const totalReviews = allReviews.length;
  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

  const ratingDistribution = allReviews.reduce(
    (acc, review) => {
      acc[review.rating as keyof typeof acc]++;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

  return {
    averageRating,
    totalReviews,
    ratingDistribution,
  };
}

export async function getCurrentUserReview(productId: string) {
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

    const review = await db.query.reviews.findFirst({
      where: and(eq(reviews.productId, productId), eq(reviews.userId, session.user.id), isNull(reviews.deletedAt)),
      with: {
        user: true,
      },
    });

    return review;
  } catch (error) {
    console.error("Error getting current user review:", error);
    return null;
  }
}
