import { Carousel } from "@/components/ui/carousel";

interface CategoryBannerCarouselProps {
  banners: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  categoryName: string;
  className?: string;
}

export function CategoryBannerCarousel({ banners, categoryName, className = "" }: CategoryBannerCarouselProps) {
  if (!banners || banners.length === 0) {
    return null;
  }

  const carouselImages = banners.map((banner, index) => ({
    url: banner.url,
    alt: banner.alt || `${categoryName} Banner ${index + 1}`,
    width: banner.width,
    height: banner.height,
  }));

  return (
    <div className={`w-full ${className}`}>
      <Carousel
        autoPlay={true}
        className="w-full"
        images={carouselImages}
        interval={5000}
        showArrows={true}
        showDots={true}
      />
    </div>
  );
}
