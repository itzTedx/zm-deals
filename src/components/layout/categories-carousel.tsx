import Link from "next/link";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoriesCarouselProps {
  categories: Category[];
}

export function CategoriesCarousel({ categories }: CategoriesCarouselProps) {
  if (!categories.length) return null;

  return (
    <div className="relative py-1">
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: false,
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-1">
          {categories.map((category) => (
            <CarouselItem className="basis-auto pl-1" key={category.id}>
              <Link
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-2 py-1.5 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                href={`/categories/${category.slug}`}
              >
                {category.name}
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-6 size-6 [&_div>svg]:size-3" />
        <CarouselNext className="-right-6 size-6 [&_div>svg]:size-3" />
      </Carousel>
    </div>
  );
}
