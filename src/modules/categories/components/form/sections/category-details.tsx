import Image from "next/image";

import { useUploadFile } from "better-upload/client";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/components/ui/upload-button";

import { CategorySchema } from "@/modules/categories/schema";
import { getImageMetadata } from "@/modules/product/actions/helper";
import { CATEGORY_FILE_TYPES, CATEGORY_UPLOAD_ROUTE } from "@/modules/product/constants";
import { MediaSchema } from "@/modules/product/schema";

export const CategoryDetails = () => {
  const form = useFormContext<CategorySchema>();

  const { control: thumbnailControl } = useUploadFile({
    route: CATEGORY_UPLOAD_ROUTE,
    onUploadComplete: async ({ file, metadata: objectMetadata }) => {
      if (!file) return;

      try {
        const metadata = await getImageMetadata(file.raw);

        const image: MediaSchema = {
          ...metadata,
          url: (objectMetadata.urls as string[])[0] || (objectMetadata.url as string),
          key: file.objectKey,
          type: "thumbnail",
        };

        form.setValue("thumbnail", {
          url: image.url,
          key: image.key,
          type: image.type,
          ...metadata,
        });

        toast.success("Thumbnail uploaded successfully");
      } catch (error) {
        console.error("Error processing thumbnail:", error);
        toast.error("Failed to process thumbnail");
      }
    },
  });

  function handleRemoveThumbnail() {
    form.setValue("thumbnail", undefined);
  }

  return (
    <Card className="h-fit p-0.5">
      <CardContent className="space-y-6 p-4">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Category Name" {...field} />
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
                  <Textarea
                    className="min-h-32"
                    placeholder="Category Description (maximum 256 characters)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thumbnail"
            render={() => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {form.watch("thumbnail")?.url ? (
                      <div className="relative flex aspect-4/3 h-52 items-center gap-2">
                        <Image
                          alt="Category Thumbnail"
                          className="rounded-md object-cover"
                          fill
                          src={form.watch("thumbnail")?.url ?? ""}
                        />
                        <Button
                          className="absolute top-2 right-2"
                          onClick={handleRemoveThumbnail}
                          size="btn"
                          type="button"
                          variant="destructive"
                        >
                          <X />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative flex size-40 items-center justify-center rounded-md border transition-colors hover:bg-muted">
                        <UploadButton
                          accept={CATEGORY_FILE_TYPES.join(", ")}
                          className="absolute inset-0 h-full w-full border-border bg-transparent text-foreground shadow-none hover:bg-muted/50"
                          control={thumbnailControl}
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
