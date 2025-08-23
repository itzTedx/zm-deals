import Image from "next/image";

import { useUploadFiles } from "better-upload/client";
import { AlertCircle, Star, Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/components/ui/upload-dropzone";

import { cn } from "@/lib/utils";
import { getImageMetadata } from "@/modules/product/actions/helper";
import {
  PRODUCT_FILE_MAX_FILES,
  PRODUCT_FILE_MAX_SIZE,
  PRODUCT_FILE_TYPES,
  PRODUCT_UPLOAD_ROUTE,
} from "@/modules/product/constants";
import { ProductImageSchema, ProductSchema } from "@/modules/product/schema";

// Image Management Component
const ImageManagement = () => {
  const form = useFormContext<ProductSchema>();
  const images = useWatch({ control: form.control, name: "images" }) || [];

  const setFeaturedImage = (index: number) => {
    const updatedImages = images.map((image, i) => ({
      ...image,
      isFeatured: i === index,
    }));
    form.setValue("images", updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = updatedImages.map((image, i) => ({
      ...image,
      order: i + 1,
      isFeatured: i === 0 && !updatedImages.some((img) => img.isFeatured), // Set first as featured if no featured image
    }));
    form.setValue("images", reorderedImages);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {images.length} of {PRODUCT_FILE_MAX_FILES} images uploaded
        </p>
        {images.length >= PRODUCT_FILE_MAX_FILES && (
          <Alert className="py-2">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">
              Maximum {PRODUCT_FILE_MAX_FILES} images allowed. Remove an image to upload more.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted" key={index}>
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
                    size="sm"
                    title={image.isFeatured ? "Currently featured" : "Set as featured"}
                    variant="secondary"
                  >
                    <Star className={cn("size-4", image.isFeatured && "fill-yellow-400 text-yellow-400")} />
                  </Button>
                  <Button onClick={() => removeImage(index)} size="sm" title="Remove image" variant="destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured badge */}
            {image.isFeatured && (
              <Badge className="absolute top-2 left-2" variant="secondary">
                Featured
              </Badge>
            )}
          </div>
        ))}
      </div>

      <div className="text-muted-foreground text-xs">
        <p>• The first image will be used as the main product image</p>
        <p>• Click the star icon to set an image as featured</p>
      </div>
    </div>
  );
};

export const ProductDetails = () => {
  const form = useFormContext<ProductSchema>();
  const images = useWatch({ control: form.control, name: "images" }) || [];

  const { control } = useUploadFiles({
    route: PRODUCT_UPLOAD_ROUTE,
    onUploadComplete: async ({ files, metadata: objectMetadata }) => {
      // Get current images array
      const currentImages = form.getValues("images") || [];

      // Check if we can add more images
      const availableSlots = PRODUCT_FILE_MAX_FILES - currentImages.length;
      const filesToProcess = files.slice(0, availableSlots);

      if (filesToProcess.length === 0) {
        return; // No space for new images
      }

      // Process each uploaded file
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const metadata = await getImageMetadata(file.raw);

        // Create new image object according to ProductSchema
        const newImage: ProductImageSchema = {
          ...metadata,
          url: objectMetadata.url as string,
          isFeatured: currentImages.length === 0 && i === 0, // First image is featured if no images exist
          order: currentImages.length + i + 1,
          key: objectMetadata.key as string,
        };

        // Add to images array
        form.setValue(`images.${currentImages.length + i}`, newImage);
      }
    },
  });

  return (
    <Card className="p-0.5">
      <CardContent className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Product Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="overview"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overview</FormLabel>
              <FormControl>
                <Textarea className="min-h-20" placeholder="Short Overview about the product" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {images.length < PRODUCT_FILE_MAX_FILES ? (
                    <UploadDropzone
                      accept="image/*"
                      control={control}
                      description={{
                        maxFiles: PRODUCT_FILE_MAX_FILES - images.length,
                        maxFileSize: PRODUCT_FILE_MAX_SIZE.toString(),
                        fileTypes: PRODUCT_FILE_TYPES.join(", "),
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
                      <div className="text-center">
                        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 font-medium text-sm">Maximum images reached</p>
                        <p className="text-muted-foreground text-xs">Remove an image to upload more</p>
                      </div>
                    </div>
                  )}
                  <ImageManagement />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="min-h-32" placeholder="Product Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
