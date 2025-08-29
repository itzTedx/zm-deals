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
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { FieldArrayWithId } from "react-hook-form";
import { toast } from "sonner";

import { CategorySchema } from "@/modules/categories/schema";

import { BannerOverlay } from "./banner-overlay";
import { SortableBannerItem } from "./sortable-banner-item";
import { useDragState } from "./use-drag-state";

interface BannerManagementProps {
  fields: FieldArrayWithId<CategorySchema, "banners", "id">[];
  onRemove: (index: number) => void;
  onReorder: (from: number, to: number) => void;
}

export function BannerManagement({ fields, onRemove, onReorder }: BannerManagementProps) {
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
        onReorder(oldIndex, newIndex);
        toast.success("Banner order updated");
      }
    }
  };

  const handleRemove = (index: number) => {
    onRemove(index);
    toast.success("Banner removed");
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
        aria-label="Category banners grid"
        className={`grid grid-cols-2 gap-2 transition-opacity duration-200 ${
          isDragging ? "opacity-75" : "opacity-100"
        }`}
        role="region"
      >
        <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
          {fields.map((item, index) => (
            <SortableBannerItem index={index} item={item} key={item.id} onRemove={() => handleRemove(index)} />
          ))}
        </SortableContext>
      </div>

      <DragOverlay
        dropAnimation={null}
        style={{
          zIndex: 1000,
        }}
      >
        {activeItem ? <BannerOverlay item={activeItem} /> : null}
      </DragOverlay>

      {isDragging && (
        <div aria-live="polite" className="sr-only" id="drag-instructions">
          Drag to reorder banners. Use arrow keys to move items when focused.
        </div>
      )}
    </DndContext>
  );
}
