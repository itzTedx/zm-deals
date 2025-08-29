import { useRef } from "react";
import Image from "next/image";

import { GripVertical } from "lucide-react";
import { FieldArrayWithId } from "react-hook-form";

import { CategorySchema } from "@/modules/categories/schema";

interface BannerOverlayProps {
  item: FieldArrayWithId<CategorySchema, "banners", "id">;
}

export function BannerOverlay({ item }: BannerOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="aspect-[16/9] scale-105 transform rounded-md opacity-85 shadow-xl transition-all duration-150"
      ref={overlayRef}
    >
      <div className="group relative flex size-full flex-col items-center justify-center overflow-hidden rounded-md border border-primary/30 bg-background shadow-lg">
        {/* Drag Handle */}
        <div className="absolute top-2 right-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="relative flex size-full flex-col items-center justify-center">
          <Image
            alt={item.url}
            blurDataURL={item.blurData ?? undefined}
            className="object-cover"
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
