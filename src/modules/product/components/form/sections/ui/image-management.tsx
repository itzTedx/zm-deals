import { useMemo } from "react";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { FieldArrayWithId, useFormContext } from "react-hook-form";

import { ProductSchema } from "@/modules/product/schema";

import { ImageOverlay } from "./image-overlay";
import { SortableImageItem } from "./sortable-image-item";
import { useDragState } from "./use-drag-state";

interface ImageManagementProps {
  fields: FieldArrayWithId<ProductSchema, "images", "id">[];
  reorder: (from: number, to: number) => void;
}

export function ImageManagement({ fields, reorder }: ImageManagementProps) {
  const form = useFormContext<ProductSchema>();

  const { activeId, isDragging, handleDragStart, handleDragEnd } = useDragState();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        switch (event.code) {
          case "ArrowRight":
            return { x: 1, y: 0 };
          case "ArrowLeft":
            return { x: -1, y: 0 };
          case "ArrowDown":
            return { x: 0, y: 1 };
          case "ArrowUp":
            return { x: 0, y: -1 };
          default:
            return { x: 0, y: 0 };
        }
      },
    })
  );

  const handleDragEndWithMove = (event: DragEndEvent) => {
    const { active, over } = event;

    handleDragEnd(event);

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Use reorder from props to properly update form state
        reorder(oldIndex, newIndex);

        // Update order field for all items after the move
        const updatedItems = arrayMove(fields, oldIndex, newIndex);
        updatedItems.forEach((item, index) => {
          if (item.order !== index) {
            form.setValue(`images.${index}.order`, index);
          }
        });
      }
    }
  };

  const activeItem = useMemo(() => {
    return activeId ? fields.find((item) => item.id === activeId) : null;
  }, [activeId, fields]);

  const sortableItems = useMemo(() => {
    return fields.map((item) => item.id);
  }, [fields]);

  if (fields.length === 0) {
    return null;
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEndWithMove}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div
        aria-describedby={isDragging ? "drag-instructions" : undefined}
        aria-label="Product images grid"
        className={`grid grid-cols-6 grid-rows-2 gap-1.5 transition-opacity duration-200 ${
          isDragging ? "opacity-75" : "opacity-100"
        }`}
        role="region"
      >
        <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
          {fields.map((item, index) => (
            <SortableImageItem index={index} isFirst={index === 0} item={item} key={item.id} />
          ))}

          {/* <button
            className="flex cursor-pointer items-center justify-center rounded-md border transition-colors hover:bg-muted"
            type="button"
          >
            <Plus className="size-5 text-gray-600" />
          </button> */}
        </SortableContext>
      </div>

      <DragOverlay
        dropAnimation={null}
        style={{
          zIndex: 1000, // Ensure overlay is above everything
        }}
      >
        {activeItem ? <ImageOverlay item={activeItem} /> : null}
      </DragOverlay>

      {isDragging && (
        <div aria-live="polite" className="sr-only" id="drag-instructions">
          Drag to reorder images. Use arrow keys to move items when focused.
        </div>
      )}
    </DndContext>
  );
}
