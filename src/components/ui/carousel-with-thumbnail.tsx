"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { type EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { Media, ProductImage } from "@/modules/product/types";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./dialog";

type ThumbPropType = {
  selected: boolean;
  index: number;
  onClick: () => void;
  imgUrl: string;
  blurDataURL?: string;
  title?: string;
};

const getAspectRatioClass = (ratio?: string) => {
  switch (ratio) {
    case "square":
      return "aspect-square"; // 1:1
    case "video":
      return "aspect-video"; // 16:9
    case "wide":
      return "aspect-4/3"; // 4:3
    case "5/4":
      return "aspect-5/4";
    case "auto":
      return "aspect-auto"; // Natural image aspect ratio
    default:
      return "aspect-4/3"; // Default 4:3
  }
};

const ImageContainer: React.FC<{
  image: Media | null;
  alt: string;
  fit?: "cover" | "contain" | "fill";
  aspectRatio?: string;
  showImageControls?: boolean;
  classNameImage?: string;
  classNameThumbnail?: string;
}> = ({ alt, aspectRatio, classNameImage, classNameThumbnail, fit = "cover", image, showImageControls }) => {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-card", getAspectRatioClass(aspectRatio))}>
      <Dialog>
        <DialogTrigger asChild>
          <div className={"cursor-pointer"}>
            <Image
              alt={image?.alt ?? alt}
              blurDataURL={image?.blurData ?? undefined}
              className={cn(
                "absolute inset-0 h-full w-full",
                fit === "contain" && "object-contain",
                fit === "cover" && "object-cover",
                fit === "fill" && "object-fill",
                classNameThumbnail
              )}
              fill
              placeholder={image?.blurData ? "blur" : "empty"}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={image?.url ?? ""}
            />
          </div>
        </DialogTrigger>

        <DialogContent className="lg:max-w-fit" showCloseButton={false}>
          <DialogTitle className="sr-only">{image?.alt ?? "Image"}</DialogTitle>
          <DialogDescription className="sr-only">{image?.alt ?? "Image"}</DialogDescription>

          <div>
            <Image
              alt={image?.alt ?? "Full size"}
              blurDataURL={image?.blurData ?? undefined}
              className={cn("max-h-[90vh] max-w-[90vw] object-contain", classNameImage)}
              height={800}
              placeholder={image?.blurData ? "blur" : "empty"}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
              src={image?.url ?? ""}
              width={1200}
            />
            {/* <TransformWrapper initialPositionX={0} initialPositionY={0} initialScale={1}>
              {({ zoomIn, zoomOut }) => (
                <>
                  <TransformComponent>
                    <Image
                      alt={image?.alt ?? "Full size"}
                      blurDataURL={image?.blurData ?? undefined}
                      className={cn("max-h-[90vh] max-w-[90vw] object-contain", classNameImage)}
                      height={800}
                      placeholder={image?.blurData ? "blur" : "empty"}
                      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
                      src={image?.url ?? ""}
                      width={1200}
                    />
                  </TransformComponent>
                  {showImageControls && (
                    <div className="-translate-x-1/2 absolute bottom-4 left-1/2 z-10 flex gap-2">
                      <button
                        aria-label="Zoom out"
                        className="cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                        onClick={() => zoomOut()}
                      >
                        <MinusCircle className="size-6" />
                      </button>
                      <button
                        aria-label="Zoom in"
                        className="cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                        onClick={() => zoomIn()}
                      >
                        <PlusCircle className="size-6" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </TransformWrapper> */}
            <DialogClose asChild>
              <button
                aria-label="Close"
                className="absolute top-4 right-4 z-10 cursor-pointer rounded-full border bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                <X className="size-6" />
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Thumb: React.FC<ThumbPropType> = (props) => {
  const { imgUrl, index, onClick, selected, title, blurDataURL } = props;

  return (
    <div
      className={cn(
        "transition-opacity duration-200",

        // Horizontal layout (top/bottom)
        "group-[.thumbs-horizontal]:min-w-0 group-[.thumbs-horizontal]:flex-[0_0_22%] group-[.thumbs-horizontal]:pl-3 sm:group-[.thumbs-horizontal]:flex-[0_0_20%]",
        // Vertical layout (left/right)
        "group-[.thumbs-vertical]:w-full group-[.thumbs-vertical]:pt-3"
      )}
    >
      <button
        className="relative w-full cursor-pointer touch-manipulation appearance-none overflow-hidden rounded-md border-0 bg-transparent p-0"
        onClick={onClick}
        type="button"
      >
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-lg bg-gray-100",
            selected ? "border-2 border-brand-500/50" : "",
            getAspectRatioClass("square")
          )}
        >
          <Image
            alt={title || `Thumbnail ${index + 1}`}
            blurDataURL={blurDataURL ?? undefined}
            className={cn("h-full w-full bg-card object-contain")}
            fill
            placeholder={blurDataURL ? "blur" : "empty"}
            sizes="(max-width: 768px) 20vw, 15vw"
            src={imgUrl}
          />
        </div>
      </button>
    </div>
  );
};

type CarouselImage = {
  title?: string;
  url: string;
};

type CarouselImages = CarouselImage[];
interface ImageCarousel_BasicProps extends React.HTMLAttributes<HTMLDivElement> {
  images: ProductImage[];
  opts?: EmblaOptionsType;
  showCarouselControls?: boolean;
  showImageControls?: boolean;
  imageFit?: "cover" | "contain" | "fill";
  aspectRatio?: "square" | "video" | "wide" | "auto" | "5/4";
  thumbPosition?: "bottom" | "top" | "left" | "right";
  showThumbs?: boolean;
  // Controlled mode props
  selectedIndex?: number;
  onSlideChange?: (index: number) => void;
  classNameImage?: string;
  classNameThumbnail?: string;
}

const ImageCarousel: React.FC<ImageCarousel_BasicProps> = ({
  aspectRatio = "wide",
  className,
  classNameImage,
  classNameThumbnail,
  imageFit = "contain",
  images,
  onSlideChange,
  opts,
  // Controlled mode props
  selectedIndex: controlledIndex,
  showCarouselControls = true,
  showImageControls = true,
  showThumbs = true,
  thumbPosition = "bottom",
  ...props
}) => {
  const isControlled = controlledIndex !== undefined;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...opts,
    axis: "x",
  });

  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel(
    showThumbs
      ? {
          axis: thumbPosition === "left" || thumbPosition === "right" ? "y" : "x",
          containScroll: "keepSnaps",
          dragFree: true,
        }
      : undefined
  );

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi || !showThumbs || !emblaThumbsApi) return;

      if (isControlled && onSlideChange) {
        onSlideChange(index);
      } else {
        emblaApi.scrollTo(index);
        emblaThumbsApi.scrollTo(index);
      }
    },
    [emblaApi, emblaThumbsApi, showThumbs, isControlled, onSlideChange]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);

  // Use either controlled or internal state
  const currentIndex = isControlled ? controlledIndex : internalSelectedIndex;

  const scrollPrev = useCallback(() => {
    if (isControlled && onSlideChange) {
      const prevIndex = Math.max(0, currentIndex - 1);
      onSlideChange(prevIndex);
    } else if (emblaApi) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi, isControlled, onSlideChange, currentIndex]);

  const scrollNext = useCallback(() => {
    if (isControlled && onSlideChange && images) {
      const nextIndex = Math.min(images.length - 1, currentIndex + 1);
      onSlideChange(nextIndex);
    } else if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi, isControlled, onSlideChange, currentIndex, images]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    const selectedSlideIndex = emblaApi.selectedScrollSnap();
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());

    if (!isControlled) {
      setInternalSelectedIndex(selectedSlideIndex);
    } else if (onSlideChange && selectedSlideIndex !== controlledIndex) {
      onSlideChange(selectedSlideIndex);
    }

    if (showThumbs && emblaThumbsApi) {
      emblaThumbsApi.scrollTo(selectedSlideIndex);
    }
  }, [emblaApi, emblaThumbsApi, showThumbs, isControlled, onSlideChange, controlledIndex]);

  // Effect for controlled mode to update carousel position
  useEffect(() => {
    if (isControlled && emblaApi && emblaApi.selectedScrollSnap() !== controlledIndex) {
      emblaApi.scrollTo(controlledIndex);
      if (showThumbs && emblaThumbsApi) {
        emblaThumbsApi.scrollTo(controlledIndex);
      }
    }
  }, [controlledIndex, emblaApi, emblaThumbsApi, isControlled, showThumbs]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div
      aria-roledescription="carousel"
      className={cn(
        "relative w-full max-w-4xl",
        {
          "flex-row-reverse": showThumbs && thumbPosition === "left",
          "flex gap-4": showThumbs && (thumbPosition === "left" || thumbPosition === "right"),
        },
        className
      )}
      onKeyDownCapture={handleKeyDown}
      role="region"
      {...props}
    >
      {showThumbs && thumbPosition === "top" && (
        <div className="mb-4">
          <div className="overflow-hidden" ref={emblaThumbsRef}>
            <div className="thumbs-horizontal group -ml-3 flex">
              {images?.map((image, index) => (
                <Thumb
                  blurDataURL={image.media?.blurData ?? undefined}
                  imgUrl={image.media?.url ?? ""}
                  index={index}
                  key={index}
                  onClick={() => onThumbClick(index)}
                  selected={index === currentIndex}
                  title={image.media?.alt ?? ""}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        aria-label="Image carousel controls"
        className={cn(
          "relative",
          showThumbs && (thumbPosition === "left" || thumbPosition === "right") && "flex-[1_1_75%]"
        )}
      >
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="-ml-4 flex">
            {images?.map((image, index) => (
              <div
                aria-roledescription="slide"
                className="min-w-0 shrink-0 grow-0 basis-full pl-4"
                key={index}
                role="group"
              >
                <ImageContainer
                  alt={`Slide ${index + 1}`}
                  aspectRatio={aspectRatio}
                  classNameImage={classNameImage}
                  classNameThumbnail={classNameThumbnail}
                  fit={imageFit}
                  image={image.media}
                  showImageControls={showImageControls}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showThumbs && (thumbPosition === "bottom" || thumbPosition === "left" || thumbPosition === "right") && (
        <div
          className={cn(
            thumbPosition === "left" || thumbPosition === "right" ? "relative flex-[0_0_20%]" : "relative mt-4"
          )}
        >
          <div
            className={cn(
              "overflow-hidden",
              (thumbPosition === "left" || thumbPosition === "right") && "absolute inset-0"
            )}
            ref={emblaThumbsRef}
          >
            <div
              className={cn(
                thumbPosition === "bottom"
                  ? "thumbs-horizontal group -ml-3 flex"
                  : "thumbs-vertical group -mt-3 flex h-full flex-col"
              )}
            >
              {images?.map((image, index) => (
                <Thumb
                  imgUrl={image.media?.url ?? ""}
                  index={index}
                  key={index}
                  onClick={() => onThumbClick(index)}
                  selected={index === currentIndex}
                  title={image.media?.alt ?? ""}
                />
              ))}
            </div>
          </div>
          {showCarouselControls && (
            <>
              <Button
                className="-translate-y-1/2 -translate-x-1/2 absolute top-1/2 left-0 z-10 h-8 w-8 rounded-full"
                disabled={!canScrollPrev}
                onClick={scrollPrev}
                size="icon"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous slide</span>
              </Button>

              <Button
                className="-translate-y-1/2 absolute top-1/2 right-0 z-10 h-8 w-8 translate-x-1/2 rounded-full"
                disabled={!canScrollNext}
                onClick={scrollNext}
                size="icon"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next slide</span>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
export type { CarouselImage, CarouselImages };
