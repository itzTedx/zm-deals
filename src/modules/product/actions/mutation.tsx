"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";
import z from "zod";

import { auth } from "@/lib/auth/server";
import { db } from "@/server/db";
import { metaTable, products } from "@/server/schema";

import { productSchema } from "../schema";

export async function upsertProduct(rawData: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const { data, success, error } = productSchema.safeParse(rawData);

  if (!success) {
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  try {
    return await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          title: data.title,
          overview: data.overview,
          description: data.description,
          slug: data.slug,

          price: data.price,
          compareAtPrice: data.compareAtPrice,
          inventory: data.inventory,
          image: data.images[0].url,

          isFeatured: data.isFeatured,
          endsIn: data.endsIn,
          schedule: data.schedule,
          status: "published",
        })
        .returning({
          id: products.id,
          title: products.title,
          metaId: products.metaId,
        });

      if (product.metaId && data.meta) {
        await tx
          .update(metaTable)
          .set({
            metaTitle: data.meta.title,
            metaDescription: data.meta.description,
          })
          .where(eq(metaTable.id, product.metaId));
      } else {
        const [meta] = await tx
          .insert(metaTable)
          .values({
            metaTitle: data.meta.title,
            metaDescription: data.meta.description,
          })
          .returning({
            id: metaTable.id,
          });

        await tx
          .update(products)
          .set({
            metaId: meta.id,
          })
          .where(eq(products.id, product.id));
      }

      return {
        success: true,
        message: `Product ${product.title} created successfully`,
      };
    });
  } catch {}
}
