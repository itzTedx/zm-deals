"use server";

import { db } from "@/server/db";

export async function getProducts() {
  const products = await db.query.products.findMany({
    with: {
      meta: true,
    },
  });

  return products;
}
