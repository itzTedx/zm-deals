import Image from "next/image";

import { SectionHeader } from "@/components/layout/section-header";

import { getCategories } from "@/modules/categories/actions/query";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="container relative space-y-12 pb-8 sm:pb-12 md:space-y-16 md:pb-16 lg:pb-20">
      <SectionHeader description="Browse our categories" hasButton={false} title="Categories" />
      <div className="grid gap-3 sm:gap-4 md:gap-6">
        {categories.map((category) => {
          const thumbnail = category.images.find((image) => image.type === "thumbnail")?.media;
          return (
            <div key={category.id}>
              {thumbnail && thumbnail.url && <Image alt={category.name} height={100} src={thumbnail.url} width={100} />}
              {category.name}
            </div>
          );
        })}
      </div>
    </main>
  );
}
