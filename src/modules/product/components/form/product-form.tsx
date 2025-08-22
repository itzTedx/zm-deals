"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconProduct } from "@/assets/icons/product";

import { ProductSchema, productSchema } from "../../schema";

export const ProductForm = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      images: [],
      isFeatured: false,
      schedule: undefined,
    },
  });

  function onSubmit(values: ProductSchema) {
    console.log(values);
  }
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 py-4">
      <Form {...form}>
        <form className="grid grid-cols-3 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="col-span-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="flex items-center gap-2 font-medium text-gray-600 text-xl leading-none">
                <IconProduct className="size-4 text-gray-500" /> <IconChevronRight className="text-gray-400" /> Add
                Product
              </h1>
            </div>
            <Button size="sm">Save Product</Button>
          </div>
          <div className="relative col-span-2 space-y-4">
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
                        <div className="flex items-center justify-center rounded-lg border border-dashed p-6 shadow-xs aria-invalid:border-destructive aria-invalid:bg-destructive/5 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40">
                          <Button size="sm" type="button" variant="outline">
                            Upload Image
                          </Button>
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
            <Card className="col-span-2 p-0.5">
              <CardHeader className="px-4 pt-1.5 pb-1">
                <CardTitle className="text-sm">Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6 p-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare At Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Compare At Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Stock" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card className="col-span-2 p-0.5">
              <CardHeader className="px-4 pt-1.5 pb-1">
                <CardTitle className="text-sm">Seo & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6 p-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare At Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Compare At Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Stock" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <div className="sticky top-28 h-fit space-y-4">
            <Card className="h-fit p-0.5">
              <CardHeader className="px-4 pt-1.5 pb-1">
                <CardTitle className="text-sm">Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4">
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <FormControl>
                        <Popover onOpenChange={setOpen} open={open}>
                          <PopoverTrigger asChild>
                            <Button className="w-48 justify-between font-normal" id="date" variant="outline">
                              {field.value ? field.value.toLocaleString() : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto overflow-hidden p-0">
                            <Calendar
                              captionLayout="dropdown"
                              mode="single"
                              onSelect={(date) => {
                                field.onChange(date);
                                setOpen(false);
                              }}
                              selected={field.value}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare At Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Compare At Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Stock" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card className="p-0.5">
              <CardHeader className="px-4 pt-1.5 pb-1">
                <CardTitle className="text-sm">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare At Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Compare At Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Stock" {...field} />
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
