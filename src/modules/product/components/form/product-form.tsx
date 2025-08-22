"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconProduct } from "@/assets/icons/product";

import { ProductSchema, productSchema } from "../../schema";

export const ProductForm = () => {
  // 1. Define your form.
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      images: [],
      category: "",
      tags: [],
      isFeatured: false,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: ProductSchema) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 py-4">
      <Form {...form}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-2 font-semibold text-xl leading-none">
              <IconProduct className="size-4 text-gray-500" /> <IconChevronRight className="text-gray-400" /> Add
              Product
            </h1>
          </div>
          <Button size="sm">Save Product</Button>
        </div>
        <form className="grid grid-cols-3 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="col-span-2">
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
                <FormField
                  control={form.control}
                  name="images"
                  render={() => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center rounded-lg border border-dashed p-6 shadow-xs">
                          <Button size="sm" type="button" variant="outline">
                            Upload Image
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card className="col-span-2 p-0.5">
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
                <FormField
                  control={form.control}
                  name="images"
                  render={() => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center rounded-lg border border-dashed p-6 shadow-xs">
                          <Button size="sm" type="button" variant="outline">
                            Upload Image
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
};
