"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useUploadFiles } from "better-upload/client";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzoneProgress } from "@/components/ui/upload-dropzone-progress";

import { CategorySchema, categorySchema } from "@/modules/categories/schema";
import { getImageMetadata } from "@/modules/product/actions/helper";
import {
  CATEGORY_BANNER_FILE_MAX_FILES,
  CATEGORY_BANNER_FILE_MAX_SIZE,
  CATEGORY_BANNER_FILE_TYPES,
  CATEGORY_BANNER_UPLOAD_ROUTE,
  CATEGORY_FILE_MAX_SIZE,
  CATEGORY_FILE_TYPES,
  CATEGORY_UPLOAD_ROUTE,
} from "@/modules/product/constants";
import { MediaSchema } from "@/modules/product/schema";

import { upsertCategory } from "../../actions/mutation";
import { BannerManagement } from "./banner-management";

interface CategoryFormProps {
  initialData?: CategorySchema;
  isEdit?: boolean;
  setModalOpen: (open: boolean) => void;
}

export const CategoryForm = ({ initialData, isEdit = false, setModalOpen }: CategoryFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      image: initialData?.image ?? undefined,
      banners: initialData?.banners ?? [],
    },
    reValidateMode: "onBlur",
  });

  const {
    fields: bannerFields,
    append: appendBanner,
    move: moveBanner,
    remove: removeBanner,
  } = useFieldArray({
    control: form.control,
    name: "banners",
  });

  const { control: thumbnailControl } = useUploadFiles({
    route: CATEGORY_UPLOAD_ROUTE,
    onUploadComplete: async ({ files, metadata: objectMetadata }) => {
      if (files.length === 0) return;

      const file = files[0];
      try {
        const metadata = await getImageMetadata(file.raw);

        const image: MediaSchema = {
          ...metadata,
          url: (objectMetadata.urls as string[])[0] || (objectMetadata.url as string),
          key: file.objectKey,
          type: "thumbnail",
        };

        form.setValue("image", {
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

  async function onSubmit(values: CategorySchema) {
    startTransition(async () => {
      try {
        const result = await upsertCategory(values);

        if (result.success) {
          toast.success(result.message);
          router.refresh();
          setModalOpen(false);
        } else {
          toast.error(result.message ?? "Something went wrong");
        }
      } catch (error) {
        console.error("Error submitting category:", error);
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Form {...form}>
      <form className="grid grid-cols-[2fr_1fr] gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="category-slug"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-")
                        .replace(/^-|-$/g, "");
                      field.onChange(value);
                    }}
                  />
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
        </div>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {form.watch("image")?.url && (
                      <div className="flex items-center gap-2">
                        <Image
                          alt="Category Thumbnail"
                          className="h-20 w-20 rounded-md object-cover"
                          height={120}
                          src={form.watch("image")?.url ?? ""}
                          width={120}
                        />
                      </div>
                    )}

                    <UploadDropzoneProgress
                      accept={CATEGORY_FILE_TYPES.join(", ")}
                      control={thumbnailControl}
                      description={{
                        maxFiles: 1,
                        maxFileSize: CATEGORY_FILE_MAX_SIZE.toString(),
                        fileTypes: CATEGORY_FILE_TYPES.join(", "),
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <Button className="w-full" disabled={isPending} type="submit">
            <LoadingSwap isLoading={isPending}>{isEdit ? "Update Category" : "Create Category"}</LoadingSwap>
          </Button>
        </div>
      </form>
    </Form>
  );
};
