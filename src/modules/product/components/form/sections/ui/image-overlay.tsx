import { GripVertical } from "lucide-react";
import { FieldArrayWithId } from "react-hook-form";

import { ProductSchema } from "@/modules/product/schema";

interface ImageOverlayProps {
  item: FieldArrayWithId<ProductSchema, "images", "id">;
}

export function ImageOverlay({ item }: ImageOverlayProps) {
  return (
    <div className="aspect-4/3 scale-105 transform rounded-md shadow-2xl">
      <div className="group relative flex size-full flex-col items-center justify-center overflow-hidden rounded-md border-2 border-primary/30 bg-background shadow-lg">
        {/* Drag Handle */}
        <div className="absolute top-2 right-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="font-medium text-foreground text-sm">{item.order}</span>
          <span className="max-w-full truncate px-2 text-center text-muted-foreground text-xs">{item.url}</span>
        </div>

        {/* Drag Overlay Effect */}
        <div className="absolute inset-0 rounded-md bg-primary/5" />
      </div>
    </div>
  );
}
