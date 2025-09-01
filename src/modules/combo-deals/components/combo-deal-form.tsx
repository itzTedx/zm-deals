"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useUploadFiles } from "better-upload/client";
import { format } from "date-fns";
import { CalendarIcon, GripVertical, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzoneProgress } from "@/components/ui/upload-dropzone-progress";

import { cn, formatBytes } from "@/lib/utils";
import { getImageMetadata } from "@/modules/product/actions/helper";
import { getProducts } from "@/modules/product/actions/query";
import {
  COMBO_DEAL_FILE_MAX_FILES,
  COMBO_DEAL_FILE_MAX_SIZE,
  COMBO_DEAL_UPLOAD_ROUTE,
} from "@/modules/product/constants";

import { createComboDeal, updateComboDeal } from "../actions/mutation";
import type { ComboDealFormData, ComboDealWithProducts } from "../types";

interface ComboDealFormProps {
  initialData?: ComboDealWithProducts | null;
  isEditMode?: boolean;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  image: string;
  price: string;
}

export function ComboDealForm({ initialData, isEditMode = false }: ComboDealFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{
      productId: string;
      quantity: number;
      sortOrder: number;
      product?: Product;
    }>
  >([]);

  const [formData, setFormData] = useState<ComboDealFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    slug: initialData?.slug || "",
    originalPrice: initialData ? Number.parseFloat(initialData.originalPrice) : 0,
    comboPrice: initialData ? Number.parseFloat(initialData.comboPrice) : 0,
    savings: initialData?.savings ? Number.parseFloat(initialData.savings) : undefined,
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive ?? true,
    startsAt: initialData?.startsAt || undefined,
    endsAt: initialData?.endsAt || undefined,
    maxQuantity: initialData?.maxQuantity || undefined,
    products: [],
    images: initialData?.images || [],
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (initialData?.products) {
      const mappedProducts = initialData.products
        .filter((cp) => cp.product)
        .map((cp) => ({
          productId: cp.productId || "",
          quantity: cp.quantity,
          sortOrder: cp.sortOrder || 0,
          product: cp.product || undefined,
        }));
      setSelectedProducts(mappedProducts);
      setFormData((prev) => ({
        ...prev,
        products: mappedProducts,
      }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof ComboDealFormData, value: string | number | boolean | Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addProduct = () => {
    const newProduct = {
      productId: "",
      quantity: 1,
      sortOrder: selectedProducts.length,
    };
    setSelectedProducts((prev) => [...prev, newProduct]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: "productId" | "quantity" | "sortOrder", value: string | number) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Update the product reference if productId changed
      if (field === "productId") {
        const product = products.find((p) => p.id === value);
        updated[index].product = product;
      }

      return updated;
    });
  };

  const calculateOriginalPrice = () => {
    return selectedProducts.reduce((total, sp) => {
      const product = products.find((p) => p.id === sp.productId);
      if (product) {
        return total + Number.parseFloat(product.price) * sp.quantity;
      }
      return total;
    }, 0);
  };

  const calculateSavings = () => {
    const original = calculateOriginalPrice();
    return original - formData.comboPrice;
  };

  const { control: imageControl } = useUploadFiles({
    route: COMBO_DEAL_UPLOAD_ROUTE,
    onUploadComplete: async ({ files, metadata: objectMetadata }) => {
      // Get current images array
      const currentImages = formData.images || [];

      // Check if we can add more images
      const availableSlots = COMBO_DEAL_FILE_MAX_FILES - currentImages.length;
      const filesToProcess = files.slice(0, availableSlots);

      if (filesToProcess.length === 0) {
        return;
      }

      // Process each uploaded file
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];

        try {
          const metadata = await getImageMetadata(file.raw);

          // Create new image object
          const newImage = {
            ...metadata,
            url: (objectMetadata.urls as string[])[i] || (objectMetadata.url as string),
            isFeatured: currentImages.length === 0 && i === 0,
            sortOrder: currentImages.length === 0 && i === 0 ? 0 : currentImages.length + i + 1,
            key: file.objectKey,
          };

          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), newImage],
          }));
        } catch (error) {
          console.error("Error processing file:", error);
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update form data with current selected products
      const updatedFormData = {
        ...formData,
        products: selectedProducts.filter((sp) => sp.productId),
        originalPrice: calculateOriginalPrice(),
        savings: calculateSavings(),
      };

      const result =
        isEditMode && initialData
          ? await updateComboDeal({ ...updatedFormData, id: initialData.id })
          : await createComboDeal(updatedFormData);

      if (result.success) {
        router.push("/studio/products/combo");
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Failed to save combo deal", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the basic details for your combo deal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter combo deal title"
                required
                value={formData.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="combo-deal-slug"
                required
                value={formData.slug}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter combo deal description"
              rows={3}
              value={formData.description}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input
                className="bg-muted"
                id="originalPrice"
                readOnly
                step="0.01"
                type="number"
                value={calculateOriginalPrice().toFixed(2)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comboPrice">Combo Price</Label>
              <Input
                id="comboPrice"
                onChange={(e) => handleInputChange("comboPrice", Number.parseFloat(e.target.value))}
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={formData.comboPrice}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savings">Savings</Label>
              <Input
                className="bg-muted"
                id="savings"
                readOnly
                step="0.01"
                type="number"
                value={calculateSavings().toFixed(2)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxQuantity">Max Quantity</Label>
              <Input
                id="maxQuantity"
                onChange={(e) =>
                  handleInputChange("maxQuantity", e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                }
                placeholder="Unlimited"
                type="number"
                value={formData.maxQuantity || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startsAt && "text-muted-foreground"
                    )}
                    variant="outline"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startsAt ? format(formData.startsAt, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    initialFocus
                    mode="single"
                    onSelect={(date) => handleInputChange("startsAt", date)}
                    selected={formData.startsAt}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endsAt && "text-muted-foreground"
                    )}
                    variant="outline"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endsAt ? format(formData.endsAt, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    initialFocus
                    mode="single"
                    onSelect={(date) => handleInputChange("endsAt", date)}
                    selected={formData.endsAt}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              id="isActive"
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isFeatured}
              id="isFeatured"
              onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
            />
            <Label htmlFor="isFeatured">Featured</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Select products to include in this combo deal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedProducts.map((selectedProduct, index) => (
            <div className="flex items-center space-x-4 rounded-lg border p-4" key={index}>
              <GripVertical className="h-4 w-4 text-muted-foreground" />

              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select
                    onValueChange={(value) => updateProduct(index, "productId", value)}
                    value={selectedProduct.productId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center space-x-2">
                            <span>{product.title}</span>
                            <Badge variant="outline">${product.price}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    min="1"
                    onChange={(e) => updateProduct(index, "quantity", Number.parseInt(e.target.value, 10))}
                    type="number"
                    value={selectedProduct.quantity}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    min="0"
                    onChange={(e) => updateProduct(index, "sortOrder", Number.parseInt(e.target.value, 10))}
                    type="number"
                    value={selectedProduct.sortOrder}
                  />
                </div>
              </div>

              <Button onClick={() => removeProduct(index)} size="sm" type="button" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={addProduct} type="button" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </CardContent>
      </Card>

      {/* Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload images for your combo deal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadDropzoneProgress
            accept="image/*"
            control={imageControl}
            description={{
              maxFiles: COMBO_DEAL_FILE_MAX_FILES - (formData.images?.length || 0),
              maxFileSize: formatBytes(COMBO_DEAL_FILE_MAX_SIZE),
            }}
          />

          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {formData.images.map((image, index) => (
                <div className="group relative" key={index}>
                  <img
                    alt={image.alt || "Combo deal image"}
                    className="h-32 w-full rounded-lg object-cover"
                    src={image.url}
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images?.filter((_, i) => i !== index),
                        }));
                      }}
                      size="sm"
                      variant="destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button onClick={() => router.push("/studio/products/combo")} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Saving..." : isEditMode ? "Update Combo Deal" : "Create Combo Deal"}
        </Button>
      </div>
    </form>
  );
}
