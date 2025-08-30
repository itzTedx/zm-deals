import Image from "next/image";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import { cn } from "@/lib/utils";
import { CategoryImage, Media } from "@/server/schema";

interface Props {
  banners?: (CategoryImage & { media: Media | null })[];
  categoryName: string;
  className?: string;
}

export const BannerCarousel = ({ banners, categoryName, className }: Props) => {
  if (!banners || banners.length === 0) return null;

  // Filter out banners with null media
  const validBanners = banners.filter((banner) => banner.media && banner.media.url);

  if (validBanners.length === 0) return null;

  // If multiple valid banners, show carousel
  if (validBanners.length > 1) {
    return (
      <Carousel>
        <CarouselContent>
          {validBanners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className={cn("relative h-56 w-full overflow-hidden rounded-xl", className)}>
                <Image alt={categoryName} className="object-cover" fill src={banner.media!.url!} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext className="right-2 size-5" />
        <CarouselPrevious className="left-2 size-5" />
      </Carousel>
    );
  }

  // If single valid banner, show static image
  const banner = validBanners[0];
  return (
    <div className={cn("relative h-56 w-full overflow-hidden rounded-xl", className)}>
      <Image alt={categoryName} className="object-cover" fill src={banner.media!.url!} />
    </div>
  );
};
