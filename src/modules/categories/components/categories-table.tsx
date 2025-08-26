"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { deleteCategory } from "../actions/mutation";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: Array<{
    media: {
      url: string | null;
    } | null;
  }>;
}

interface CategoriesTableProps {
  data: Category[];
}

export function CategoriesTable({ data }: CategoriesTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleEdit = (categoryId: string) => {
    router.push(`?category=true&categoryId=${categoryId}`);
  };

  const handleDelete = async (categoryId: string) => {
    setIsDeleting(categoryId);
    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        toast.success("Category deleted successfully");
        router.refresh();
      } else {
        toast.error(result.errors || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((category) => {
              const thumbnail = category.images?.[0]?.media?.url || null;

              return (
                <TableRow key={category.id}>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0" variant="ghost">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={isDeleting === category.id}
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting === category.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
