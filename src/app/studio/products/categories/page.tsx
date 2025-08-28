import Image from "next/image";

import { getCategories } from "@/modules/categories/actions/query";
import { CreateButton } from "@/modules/categories/components/create-button";

export default async function CategoriesAdminPage() {
  const categories = await getCategories();
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Categories</h2>
        <CreateButton />
      </div>
      {categories.map((category) => {
        const image = category.images.find((image) => image.type === "thumbnail")?.media;
        return (
          <div className="flex items-center gap-2" key={category.id}>
            {image && image.url && <Image alt={category.name} height={20} src={image.url} width={20} />}
            <h3 className="font-medium">{category.name}</h3>
          </div>
        );
      })}
    </div>
  );
}
