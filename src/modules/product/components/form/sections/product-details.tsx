import dynamic from "next/dynamic";

import { useUploadFiles } from "better-upload/client";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzoneProgress } from "@/components/ui/upload-dropzone-progress";

import { cn } from "@/lib/utils";
import { getImageMetadata } from "@/modules/product/actions/helper";
import {
  PRODUCT_FILE_MAX_FILES,
  PRODUCT_FILE_MAX_SIZE,
  PRODUCT_FILE_TYPES,
  PRODUCT_UPLOAD_ROUTE,
} from "@/modules/product/constants";
import { MediaSchema, ProductSchema } from "@/modules/product/schema";

import { ImageManagement } from "./ui/image-management";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

export const ProductDetails = () => {
  const form = useFormContext<ProductSchema>();
  const images = useWatch({ control: form.control, name: "images" }) || [];

  const { fields, append, move } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const { control } = useUploadFiles({
    route: PRODUCT_UPLOAD_ROUTE,
    onUploadComplete: async ({ files, metadata: objectMetadata }) => {
      // Get current images array
      const currentImages = form.getValues("images") || [];

      // Check if we can add more images
      const availableSlots = PRODUCT_FILE_MAX_FILES - currentImages.length;
      const filesToProcess = files.slice(0, availableSlots);

      if (filesToProcess.length === 0) {
        return;
      }

      // Process each uploaded file
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];

        try {
          const metadata = await getImageMetadata(file.raw);

          // Create new image object according to ProductSchema
          const newImage: MediaSchema = {
            ...metadata,
            url: (objectMetadata.urls as string[])[i] || (objectMetadata.url as string),
            isFeatured: currentImages.length === 0 && i === 0,
            order: currentImages.length === 0 && i === 0 ? 0 : currentImages.length + i + 1,
            key: file.objectKey,
          };

          append(newImage);

          // Trigger form validation
          await form.trigger("images");
        } catch (error) {
          console.error("Error processing file:", error);
        }
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
                  <UploadDropzoneProgress
                    accept="image/*"
                    control={control}
                    description={{
                      maxFiles: PRODUCT_FILE_MAX_FILES - images.length,
                      maxFileSize: PRODUCT_FILE_MAX_SIZE.toString(),
                      fileTypes: PRODUCT_FILE_TYPES.join(", "),
                    }}
                  />

                  <ImageManagement fields={fields} reorder={move} />
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
                <Editor
                  {...field}
                  className={cn("h-full min-h-96 w-full min-w-0 rounded-md")}
                  content={field.value}
                  editable={true}
                  editorClassName="focus:outline-hidden px-4 pb-4 pt-px h-full bg-transparent w-full dark:bg-input/30"
                  editorContentClassName="overflow-auto h-full prose dark:prose-invert prose-sm w-full max-w-none"
                  key="product-description-editor"
                  output="html"
                  placeholder="Type your description here..."
                  throttleDelay={1000}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
