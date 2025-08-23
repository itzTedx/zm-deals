"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";
import z from "zod";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { metaTable, products } from "@/server/schema";

import { productSchema } from "../schema";

export async function upsertProduct(rawData: unknown): Promise<{ success: boolean; message: string }> {
  const log = createLog("Product");

  log.info("Starting product upsert operation");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to upsert product");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Product upsert authorized", session.user.id);

  const { data, success, error } = productSchema.safeParse(rawData);

  if (!success) {
    log.error("Product data validation failed", z.prettifyError(error));
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  log.info("Product data validated successfully");
  log.data(data, "Product Data");

  try {
    log.db("Starting database transaction", "products");

    return await db.transaction(async (tx) => {
      log.db("Inserting product", "products");

      const [product] = await tx
        .insert(products)
        .values({
          title: data.title,
          overview: data.overview,
          description: data.description,
          slug: data.slug,

          price: data.price.toString(),
          compareAtPrice: data.compareAtPrice?.toString(),
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

      log.success("Product created successfully", `ID: ${product.id}, Title: ${product.title}`);

      if (product.metaId && data.meta) {
        log.db("Updating existing meta data", "meta");

        await tx
          .update(metaTable)
          .set({
            metaTitle: data.meta.title,
            metaDescription: data.meta.description,
          })
          .where(eq(metaTable.id, product.metaId));

        log.success("Meta data updated successfully");
      } else {
        log.db("Creating new meta data", "meta");

        const [meta] = await tx
          .insert(metaTable)
          .values({
            metaTitle: data.meta.title,
            metaDescription: data.meta.description,
          })
          .returning({
            id: metaTable.id,
          });

        log.db("Linking meta data to product", "products");

        await tx
          .update(products)
          .set({
            metaId: meta.id,
          })
          .where(eq(products.id, product.id));

        log.success("Meta data created and linked successfully", `Meta ID: ${meta.id}`);
      }

      log.success("Product upsert operation completed successfully");

      return {
        success: true,
        message: `Product ${product.title} created successfully`,
      };
    });
  } catch (error) {
    log.error("Product upsert operation failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to create product",
    };
  }
}
