"use client";

import Image from "next/image";

import { format } from "date-fns";
import { Package } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { DeleteButton } from "./delete-button";
import { EditButton } from "./edit-button";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    images: Array<{
      media: {
        url: string | null;
      } | null;
    }>;
    products: Array<{
      id: string;
    }>;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const thumbnail = category.images?.[0]?.media?.url || null;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {thumbnail && (
              <Image alt={category.name} className="rounded-md object-cover" height={48} src={thumbnail} width={48} />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-lg">{category.name}</h3>
              <p className="text-muted-foreground text-sm">{category.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <EditButton categoryId={category.id} size="sm" variant="icon" />
            <DeleteButton categoryId={category.id} categoryName={category.name} size="sm" variant="icon" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
          {category.description || "No description available"}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{category.products.length} products</span>
          </div>
          <span className="text-muted-foreground">{format(category.createdAt, "MMM dd, yyyy")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
