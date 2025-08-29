import { useUploadFiles } from "better-upload/client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadDropzoneProgress } from "@/components/ui/upload-dropzone-progress";

import { CategorySchema } from "@/modules/categories/schema";
import { getImageMetadata } from "@/modules/product/actions/helper";
import {
  CATEGORY_BANNER_FILE_MAX_FILES,
  CATEGORY_BANNER_FILE_MAX_SIZE,
  CATEGORY_BANNER_FILE_TYPES,
  CATEGORY_BANNER_UPLOAD_ROUTE,
} from "@/modules/product/constants";
import { MediaSchema } from "@/modules/product/schema";

import { BannerManagement } from "../banner-management";

export const CategoryBanners = () => {
  const form = useFormContext<CategorySchema>();

  const {
    fields: bannerFields,
    append: appendBanner,
    move: moveBanner,
    remove: removeBanner,
  } = useFieldArray({
    control: form.control,
    name: "banners",
  });

  const { control: bannerControl } = useUploadFiles({
    route: CATEGORY_BANNER_UPLOAD_ROUTE,
    onUploadComplete: async ({ files, metadata: objectMetadata }) => {
      if (files.length === 0) return;

      const currentBanners = form.getValues("banners") || [];
      const availableSlots = CATEGORY_BANNER_FILE_MAX_FILES - currentBanners.length;
      const filesToProcess = files.slice(0, availableSlots);

      if (filesToProcess.length === 0) {
        toast.error(`Maximum ${CATEGORY_BANNER_FILE_MAX_FILES} banners allowed`);
        return;
      }

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        try {
          const metadata = await getImageMetadata(file.raw);

          const banner: MediaSchema = {
            ...metadata,
            url: (objectMetadata.urls as string[])[i] || (objectMetadata.url as string),
            key: file.objectKey,
            type: "banner",
            order: currentBanners.length + i,
          };

          appendBanner({
            url: banner.url,
            key: banner.key,
            type: banner.type,
            order: banner.order,
            ...metadata,
          });
        } catch (error) {
          console.error("Error processing banner:", error);
          toast.error(`Failed to process banner ${i + 1}`);
        }
      }

      toast.success(`${filesToProcess.length} banner(s) uploaded successfully`);
    },
  });

  return (
    <Card className="h-fit p-0.5">
      <CardContent className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="banners"
          render={() => (
            <FormItem>
              <FormLabel>Banners (for carousel)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <UploadDropzoneProgress
                    accept={CATEGORY_BANNER_FILE_TYPES.join(", ")}
                    control={bannerControl}
                    description={{
                      maxFiles: CATEGORY_BANNER_FILE_MAX_FILES - (form.watch("banners")?.length || 0),
                      maxFileSize: CATEGORY_BANNER_FILE_MAX_SIZE.toString(),
                      fileTypes: CATEGORY_BANNER_FILE_TYPES.join(", "),
                    }}
                  />

                  <BannerManagement fields={bannerFields} onRemove={removeBanner} onReorder={moveBanner} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
