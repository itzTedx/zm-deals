"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useUploadFiles } from "better-upload/client";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/components/ui/upload-dropzone";

import { CATEGORY_FILE_MAX_SIZE, CATEGORY_FILE_TYPES, CATEGORY_UPLOAD_ROUTE } from "@/modules/product/constants";

import { CategorySchema, categorySchema } from "./schema";

export const CategoryForm = () => {
  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),

    reValidateMode: "onBlur",
  });

  function onSubmit(values: CategorySchema) {
    console.log(values);
  }

  const { control } = useUploadFiles({
    route: CATEGORY_UPLOAD_ROUTE,
    onUploadComplete: async ({ files, metadata: objectMetadata }) => {
      console.log("Upload completed:", { files: files.length, metadata: objectMetadata });
    },
  });

  return (
    <Form {...form}>
      <form className="grid grid-cols-[1fr_2fr] gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="h-full">
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <UploadDropzone
                    accept="image/*"
                    control={control}
                    description={{
                      maxFileSize: CATEGORY_FILE_MAX_SIZE.toString(),
                      fileTypes: CATEGORY_FILE_TYPES.join(", "),
                    }}
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
                  <Textarea className="min-h-32" placeholder="Category Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
