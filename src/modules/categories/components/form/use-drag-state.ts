import { useCallback, useState } from "react";

import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

export function useDragState() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((_event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false);
  }, []);

  return {
    activeId,
    isDragging,
    handleDragStart,
    handleDragEnd,
  };
}
