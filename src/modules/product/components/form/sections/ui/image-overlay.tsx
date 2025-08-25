import Image from "next/image";

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

        <div className="relative flex size-full flex-col items-center justify-center">
          <Image
            alt={item.url}
            blurDataURL={item.blurData ?? undefined}
            className="object-contain"
            fill
            placeholder={item.blurData ? "blur" : "empty"}
            src={item.url}
          />
        </div>

        {/* Drag Overlay Effect */}
        <div className="absolute inset-0 rounded-md bg-primary/5" />
      </div>
    </div>
  );
}
