import { Fragment } from "react";
import type { Route } from "next";
import Image from "next/image";

import { SectionHeader } from "@/components/layout/section-header";
import { Separator } from "@/components/ui/separator";

import { getCategories } from "@/modules/categories/actions/query";
import { ProductCard } from "@/modules/product/components";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="container relative space-y-12 py-8 sm:pb-12 md:space-y-16 md:pb-16 lg:pb-20">
      <div className="grid gap-3 sm:gap-4 md:gap-12 lg:gap-16">
        {categories.map((category) => {
          const thumbnail = category.images.find((image) => image.type === "thumbnail")?.media;
          return (
            <Fragment key={category.id}>
              <section className="space-y-4 md:space-y-6 lg:space-y-8" id={category.name}>
                {thumbnail && thumbnail.url && (
                  <div className="relative h-56 w-full overflow-hidden rounded-xl">
                    <Image alt={category.name} className="object-cover" fill src={thumbnail.url} />
                  </div>
                )}
                <SectionHeader
                  btnText={category.name}
                  description={category.description}
                  link={`/categories/${category.slug}` as Route}
                  title={category.name}
                />
                <article className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {category.products.map((product) => (
                    <ProductCard data={product} key={product.id} />
                  ))}
                </article>
              </section>
              <Separator />
            </Fragment>
          );
        })}
      </div>
    </main>
  );
}
