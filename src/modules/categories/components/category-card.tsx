"use client";

import Image from "next/image";

import { format } from "date-fns";
import { Package } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { CategoryWithRelations } from "../types";
import { DeleteButton } from "./delete-button";
import { EditButton } from "./edit-button";

interface CategoryCardProps {
  category: CategoryWithRelations;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const thumbnail = category.images?.[0]?.media?.url || null;

  return (
    <Card className="group relative">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {thumbnail && (
              <Image alt={category.name} className="rounded-md object-cover" height={48} src={thumbnail} width={48} />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{category.name}</h3>
              <p className="text-muted-foreground text-xs">{category.slug}</p>
            </div>
          </div>
        </div>
        <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
          {category.description || "No description available"}
        </p>
        <div className="flex items-center gap-1">
          <EditButton categoryId={category.id} size="sm" />
          <DeleteButton categoryId={category.id} categoryName={category.name} size="sm" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="size-4" />
            <span>{category.products?.length} products</span>
          </div>
          <span className="text-muted-foreground text-xs">{format(category.createdAt, "MMM dd, yyyy")}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
