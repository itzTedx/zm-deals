import { CategoryBannerCarousel } from "./category-banner-carousel";

interface CategoryPageExampleProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: {
      url: string;
      alt?: string;
    };
    banners?: Array<{
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    }>;
  };
}

export function CategoryPageExample({ category }: CategoryPageExampleProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Banner Carousel */}
      <div className="mb-8">
        <CategoryBannerCarousel banners={category.banners || []} categoryName={category.name} className="mb-6" />
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {category.image && (
            <img
              alt={category.image.alt || category.name}
              className="h-16 w-16 rounded-lg object-cover"
              src={category.image.url}
            />
          )}
          <div>
            <h1 className="font-bold text-3xl text-gray-900">{category.name}</h1>
            {category.description && <p className="mt-2 text-gray-600">{category.description}</p>}
          </div>
        </div>
      </div>

      {/* Category Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Example product cards would go here */}
        <div className="rounded-lg border p-4">
          <p className="text-gray-500">Product cards would be displayed here</p>
        </div>
      </div>
    </div>
  );
}
