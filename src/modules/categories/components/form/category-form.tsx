"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useUploadFile } from "better-upload/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/components/ui/upload-button";

import { CategorySchema, categorySchema } from "@/modules/categories/schema";
import { getImageMetadata } from "@/modules/product/actions/helper";
import { CATEGORY_FILE_TYPES, CATEGORY_UPLOAD_ROUTE } from "@/modules/product/constants";
import { MediaSchema } from "@/modules/product/schema";

import { upsertCategory } from "../../actions/mutation";

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
      name: "",
      slug: "",
      description: "",
      image: undefined,
    },
    reValidateMode: "onBlur",
  });

  const { control } = useUploadFile({
    route: CATEGORY_UPLOAD_ROUTE,
    onUploadComplete: async ({ file, metadata: objectMetadata }) => {
      const metadata = await getImageMetadata(file.raw);

      console.log("metadata", metadata);
      const image: MediaSchema = {
        ...metadata,
        url: objectMetadata.url as string,
        key: file.objectKey,
        type: "thumbnail",
      };

      form.setValue("image", {
        url: image.url,
        key: image.key,
        type: image.type,
        ...metadata,
      });

      toast.success("Image uploaded successfully");
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

  // DEBUG
  // const validation = categorySchema.safeParse(form.watch());
  // console.log("validation success:", validation.success);
  // if (!validation.success) {
  //   console.log("validation errors:", z.prettifyError(validation.error));
  // }

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
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <div>
                    <div className="flex items-center gap-2">
                      {form.watch("image")?.url && (
                        <Image
                          alt="Category Thumbnail"
                          className="h-20 w-20 rounded-md object-cover"
                          height={120}
                          src={form.watch("image")?.url ?? ""}
                          width={120}
                        />
                      )}
                    </div>

                    <UploadButton accept={CATEGORY_FILE_TYPES.join(", ")} control={control} />
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
