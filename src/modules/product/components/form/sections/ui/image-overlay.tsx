import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { GripVertical } from "lucide-react";
import { FieldArrayWithId } from "react-hook-form";

import { ProductSchema } from "@/modules/product/schema";

interface ImageOverlayProps {
  item: FieldArrayWithId<ProductSchema, "images", "id">;
  isFirst?: boolean;
}

export function ImageOverlay({ item, isFirst = false }: ImageOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isOverFirstPosition, setIsOverFirstPosition] = useState(false);
  const [gridCellSize, setGridCellSize] = useState({ width: 64, height: 64 });

  useEffect(() => {
    const checkPosition = () => {
      if (!overlayRef.current) return;

      const rect = overlayRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Get the grid container
      const gridContainer = document.querySelector('[aria-label="Product images grid"]');
      if (!gridContainer) return;

      const gridRect = gridContainer.getBoundingClientRect();

      // Calculate grid cell size
      const cellWidth = gridRect.width / 6;
      const cellHeight = gridRect.height / 2;

      setGridCellSize({ width: cellWidth, height: cellHeight });

      // Calculate which grid cell we're over
      const gridX = Math.floor((centerX - gridRect.left) / cellWidth);
      const gridY = Math.floor((centerY - gridRect.top) / cellHeight);

      // Check if we're over the first position (top-left 2x2 area)
      // The first position spans gridX 0-1 and gridY 0-1
      const isOverFirst = gridX <= 1 && gridY <= 1;

      console.log("Grid position:", { gridX, gridY, isOverFirst, cellWidth, cellHeight }); // Debug log
      setIsOverFirstPosition(isOverFirst);
    };

    // Check position on mount and when dragging
    checkPosition();

    // Set up interval to check position during drag
    const interval = setInterval(checkPosition, 50);

    return () => clearInterval(interval);
  }, []);

  const shouldBeLarge = isOverFirstPosition;
  const overlayWidth = shouldBeLarge ? gridCellSize.width * 2 : gridCellSize.width;
  const overlayHeight = shouldBeLarge ? gridCellSize.height * 2 : gridCellSize.height;

  return (
    <div
      className="aspect-square scale-105 transform rounded-md opacity-85 shadow-xl transition-all duration-150"
      ref={overlayRef}
      style={{
        width: `${overlayWidth}px`,
        height: `${overlayHeight}px`,
        pointerEvents: "none",
      }}
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
