"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Package } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { bulkDeleteCategories } from "../actions/mutation";
import { DeleteButton } from "./delete-button";
import { EditButton } from "./edit-button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
  images: Array<{
    media: {
      url: string | null;
    } | null;
  }>;
  products: Array<{
    id: string;
  }>;
}

interface CategoriesTableProps {
  data: Category[];
}

export function CategoriesTable({ data }: CategoriesTableProps) {
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const router = useRouter();

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      toast.error("No categories selected");
      return;
    }

    setIsBulkDeleting(true);
    try {
      const result = await bulkDeleteCategories(selectedCategories);
      if (result.success) {
        toast.success(`Deleted ${result.deletedCount} categories successfully`);
        setSelectedCategories([]);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete categories");
      }
    } catch (error) {
      console.error("Error bulk deleting categories:", error);
      toast.error("Something went wrong");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(data.map((category) => category.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {selectedCategories.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {selectedCategories.length} category{selectedCategories.length !== 1 ? "ies" : "y"} selected
            </span>
          </div>
          <Button disabled={isBulkDeleting} onClick={handleBulkDelete} size="sm" variant="destructive">
            {isBulkDeleting ? "Deleting..." : `Delete ${selectedCategories.length}`}
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Select all categories"
                  checked={selectedCategories.length === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((category) => {
              const thumbnail = category.images?.[0]?.media?.url || null;
              const isSelected = selectedCategories.includes(category.id);

              return (
                <TableRow key={category.id}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${category.name}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectCategory(category.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {thumbnail && (
                        <Image
                          alt={category.name}
                          className="rounded-md object-cover"
                          height={40}
                          src={thumbnail}
                          width={40}
                        />
                      )}
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-muted-foreground text-sm">{category.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate text-sm">{category.description || "No description"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{category.products.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground text-sm">{formatDate(category.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <EditButton categoryId={category.id} size="sm" variant="icon" />
                      <DeleteButton categoryId={category.id} categoryName={category.name} size="sm" variant="icon" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
