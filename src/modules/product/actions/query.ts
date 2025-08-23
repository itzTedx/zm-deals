"use server";

import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { products } from "@/server/schema";

export async function getProducts() {
  const products = await db.query.products.findMany({
    with: {
      meta: true,
      inventory: true,
    },
  });

  return products;
}

export async function getProduct(id: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      meta: true,
      inventory: true,
    },
  });

  return product;
}
