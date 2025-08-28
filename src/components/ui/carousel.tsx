"use client";

import * as React from "react";

import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

import { Button } from "@/components/ui/button";

import { MoveLeftIcon, MoveLeftIconHandle, MoveRightIcon, MoveRightIconHandle } from "@/assets/icons";

import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollTo: (index: number) => void;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    [WheelGesturesPlugin(), ...(plugins || [])]
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const handleKeyDown = React.useCallback(
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

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollTo,
      }}
    >
      <div
        aria-roledescription="carousel"
        className={cn("relative", className)}
        data-slot="carousel"
        onKeyDownCapture={handleKeyDown}
        role="region"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div className="overflow-hidden" data-slot="carousel-content" ref={carouselRef}>
      <div className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
      data-slot="carousel-item"
      role="group"
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  const ref = React.useRef<MoveLeftIconHandle>(null);
  return (
    <Button
      className={cn(
        "absolute size-10 rounded-full",
        orientation === "horizontal"
          ? "-left-12 -translate-y-1/2 top-1/2"
          : "-top-12 -translate-x-1/2 left-1/2 rotate-90",
        className
      )}
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
      size={size}
      variant={variant}
      {...props}
    >
      <MoveLeftIcon ref={ref} />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  const ref = React.useRef<MoveRightIconHandle>(null);

  return (
    <Button
      className={cn(
        "absolute size-10 rounded-full",
        orientation === "horizontal"
          ? "-right-12 -translate-y-1/2 top-1/2"
          : "-bottom-12 -translate-x-1/2 left-1/2 rotate-90",
        className
      )}
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
      size={size}
      variant={variant}
      {...props}
    >
      <MoveRightIcon ref={ref} />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

function CarouselIndicator({ className, ...props }: React.ComponentProps<"div">) {
  const { api, selectedIndex, scrollTo } = useCarousel();
  const [slidesCount, setSlidesCount] = React.useState(0);

  const onSelect = React.useCallback(() => {
    if (!api) return;
    setSlidesCount(api.slideNodes().length);
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <div
      className={cn("mx-auto flex h-2.5 w-fit items-center justify-center gap-1 rounded bg-gray-200 px-1", className)}
      data-slot="carousel-indicator"
      {...props}
    >
      {Array.from({ length: slidesCount }, (_, index) => (
        <button
          aria-current={selectedIndex === index ? "true" : "false"}
          aria-label={`Go to slide ${index + 1}`}
          className={cn(
            "size-1.5 shrink-0 rounded-full transition-all duration-200 ease-in-out",
            selectedIndex === index ? "bg-muted-foreground" : "bg-gray-300 hover:bg-muted-foreground/50"
          )}
          key={index}
          onClick={() => scrollTo(index)}
          type="button"
        >
          <span className="sr-only">Go to slide {index + 1}</span>
        </button>
      ))}
    </div>
  );
}

function CarouselProgress({ className, ...props }: React.ComponentProps<"div">) {
  const { api, selectedIndex } = useCarousel();
  const [slidesCount, setSlidesCount] = React.useState(0);

  const onSelect = React.useCallback(() => {
    if (!api) return;
    setSlidesCount(api.slideNodes().length);
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Don't render if there are no slides or only one slide
  if (slidesCount <= 1) return null;

  const progress = ((selectedIndex + 1) / slidesCount) * 100;

  return (
    <div
      className={cn("relative h-1 w-full overflow-hidden rounded-full bg-muted", className)}
      data-slot="carousel-progress"
      {...props}
    >
      <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
    </div>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicator,
  CarouselProgress,
};
