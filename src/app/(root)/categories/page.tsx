import { Fragment } from "react";
import type { Route } from "next";

import { SectionHeader } from "@/components/layout/section-header";
import { Separator } from "@/components/ui/separator";

import { getCategories } from "@/modules/categories/actions/query";
import { BannerCarousel } from "@/modules/categories/components/banner-carousel";
import { ProductCard } from "@/modules/product/components";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="container relative space-y-12 py-8 sm:pb-12 md:space-y-16 md:pb-16 lg:pb-20">
      <div className="grid gap-3 sm:gap-4 md:gap-12 lg:gap-16">
        {categories.map((category) => {
          // const thumbnail = category.images?.find((image) => image.type === "thumbnail")?.media;
          const banners = category.images?.filter((image) => image.type === "banner");

          if (!category.products || category.products.length === 0) return null;

          return (
            <Fragment key={category.id}>
              <section className="space-y-4 md:space-y-6 lg:space-y-8" id={category.name}>
                {banners && banners.length > 0 && <BannerCarousel banners={banners} categoryName={category.name} />}

                <SectionHeader
                  btnText={category.name}
                  description={category.description}
                  link={`/categories/${category.slug}` as Route}
                  title={category.name}
                  variant="secondary"
                />
                <article className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {category.products &&
                    category.products.map((product) => <ProductCard data={product} key={product.id} />)}
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
