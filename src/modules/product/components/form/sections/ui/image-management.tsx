"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { AlertCircle, Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { createSwapy, type SwapEvent, type Swapy } from "swapy";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { IconStar } from "@/assets/icons/star";

import { cn } from "@/lib/utils";
import { PRODUCT_FILE_MAX_FILES } from "@/modules/product/constants";
import { ProductSchema } from "@/modules/product/schema";

// Image Management Component
export const ImageManagement = () => {
  const form = useFormContext<ProductSchema>();
  const images = useWatch({ control: form.control, name: "images" }) || [];

  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Swapy when container is loaded and images are available
    if (containerRef.current && images.length > 1) {
      swapyRef.current = createSwapy(containerRef.current);

      // Handle swap events to update form data
      swapyRef.current.onSwap((event: SwapEvent) => {
        const { fromSlot, toSlot } = event;

        // Create a copy of the images array
        const updatedImages = [...images];

        // Find the indices of the swapped items
        const fromIndex = Number.parseInt(fromSlot, 10);
        const toIndex = Number.parseInt(toSlot, 10);

        // Swap the images
        const [movedImage] = updatedImages.splice(fromIndex, 1);
        updatedImages.splice(toIndex, 0, movedImage);

        // Update the order and featured status
        updatedImages.forEach((image, index) => {
          image.order = index + 1;
          image.isFeatured = index === 0; // First image is always featured
        });

        // Update the form
        form.setValue("images", updatedImages);
      });

      // Cleanup function
      return () => {
        if (swapyRef.current) {
          swapyRef.current.destroy();
        }
      };
    }
  }, [images]);

  const setFeaturedImage = (index: number) => {
    // Create a copy of the images array
    const updatedImages = [...images];

    // Remove the image to be featured from its current position
    const featuredImage = updatedImages.splice(index, 1)[0];

    // Set it as featured
    featuredImage.isFeatured = true;
    featuredImage.order = 1;

    // Update the order of remaining images
    updatedImages.forEach((image, i) => {
      image.isFeatured = false;
      image.order = i + 2; // Start from 2 since 1 is now the featured image
    });

    // Insert the featured image at the beginning
    updatedImages.unshift(featuredImage);

    form.setValue("images", updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);

    // Check if we removed the featured image
    const hasFeaturedImage = updatedImages.some((img) => img.isFeatured);

    // Reorder remaining images
    const reorderedImages = updatedImages.map((image, i) => ({
      ...image,
      order: i + 1,
      isFeatured: i === 0 && !hasFeaturedImage, // Set first as featured if no featured image exists
    }));

    form.setValue("images", reorderedImages);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="shrink-0 text-muted-foreground text-sm">
          {images.length} of {PRODUCT_FILE_MAX_FILES} images uploaded
        </p>
        {images.length >= PRODUCT_FILE_MAX_FILES && (
          <Alert className="w-fit px-2 py-1 has-[>svg]:gap-x-0.5" variant="destructive">
            <AlertCircle />
            <AlertDescription className="text-xs">
              Maximum {PRODUCT_FILE_MAX_FILES} images allowed. Remove an image to upload more.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 md:grid-cols-3 lg:grid-cols-6" ref={containerRef}>
        {images.map((image, index) => (
          <div
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
              index === 0 && "col-span-2 row-span-2"
            )}
            data-swapy-slot={index.toString()}
            key={`image-${index}-${image.url}`} // Better key for React reconciliation
          >
            <div data-swapy-item={index.toString()}>
              <Image
                alt={`Product image ${index + 1}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                src={image.url}
              />

              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setFeaturedImage(index)}
                      size="btn"
                      title={image.isFeatured ? "Currently featured" : "Set as featured"}
                      type="button"
                      variant="secondary"
                    >
                      <IconStar className={cn("size-4", image.isFeatured && "text-yellow-400")} />
                    </Button>
                    <Button
                      onClick={() => removeImage(index)}
                      size="btn"
                      title="Remove image"
                      type="button"
                      variant="destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Featured badge */}
              {image.isFeatured && (
                <Badge className="absolute top-2 left-2" size="sm" variant="secondary">
                  <IconStar className="!size-2.5 text-yellow-400" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-muted-foreground text-xs">
        <p>• The first image will be used as the main product image</p>
        <p>• Click the star icon to set an image as featured</p>
        <p>• Drag and drop images to reorder them</p>
      </div>
    </div>
  );
};
