import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { FieldArrayWithId } from "react-hook-form";

import { ProductSchema } from "@/modules/product/schema";

interface SortableImageItemProps {
  item: FieldArrayWithId<ProductSchema, "images", "id">;
  index: number;
  isFirst: boolean;
}

export function SortableImageItem({ item, index, isFirst }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={`aspect-4/3 rounded-md transition-all duration-200 ${
        isFirst ? "col-span-2 row-span-2" : ""
      } ${isDragging ? "z-50 scale-105 opacity-50" : "hover:scale-[1.02]"}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div
        className="group relative flex size-full flex-col items-center justify-center overflow-hidden rounded-md border-2 border-transparent bg-muted transition-colors focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/20"
        {...listeners}
        aria-describedby={`image-${item.id}-description`}
        aria-label={`Image ${index + 1}: ${item.url}`}
        aria-pressed={isDragging}
        role="button"
        tabIndex={0}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <GripVertical
            aria-hidden="true"
            className="h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="font-medium text-foreground text-sm">{item.order}</span>
          <span
            className="max-w-full truncate px-2 text-center text-muted-foreground text-xs"
            id={`image-${item.id}-description`}
          >
            {item.url}
          </span>
        </div>

        {/* Drag State Indicator */}
        {isDragging && (
          <div aria-hidden="true" className="absolute inset-0 rounded-md border-2 border-primary/30 bg-primary/10" />
        )}

        {/* Focus Indicator */}
        <div className="absolute inset-0 rounded-md ring-2 ring-transparent transition-all group-focus-within:ring-primary/30" />
      </div>
    </div>
  );
}
