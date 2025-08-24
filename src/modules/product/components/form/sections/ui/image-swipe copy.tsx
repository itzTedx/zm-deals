import { useEffect, useMemo, useRef, useState } from "react";

import { useFieldArray, useFormContext } from "react-hook-form";
import { createSwapy, SlotItemMapArray, Swapy, utils } from "swapy";

import { ProductImageSchema, ProductSchema } from "@/modules/product/schema";

export function ImageSwipe({ images }: { images: ProductImageSchema[] }) {
  const form = useFormContext<ProductSchema>();

  const { fields, move, remove, update } = useFieldArray({
    control: form.control,
    name: "images",
  });

  // Use fields from useFieldArray instead of local state
  const items = fields;

  // Initialize slotItemMap only once and update when items change
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(() => utils.initSlotItemMap(items, "url"));

  const slottedItems = useMemo(() => utils.toSlottedItems(items, "url", slotItemMap), [items, slotItemMap]);

  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update slot item map when items change
  useEffect(() => {
    utils.dynamicSwapy(swapyRef.current, items, "url", slotItemMap, setSlotItemMap);
  }, [items, slotItemMap]);

  // Initialize Swapy
  useEffect(() => {
    if (!containerRef.current) return;

    swapyRef.current = createSwapy(containerRef.current, {
      manualSwap: true,
      animation: "dynamic",
      swapMode: "drop",
      dragAxis: "both",
      dragOnHold: true,
    });

    swapyRef.current.onSwap((event) => {
      const { fromSlot, toSlot, newSlotItemMap } = event;
      setSlotItemMap(newSlotItemMap.asArray);

      const fromIndex = Number.parseInt(fromSlot, 10);
      const toIndex = Number.parseInt(toSlot, 10);

      // Use move from useFieldArray to properly update form state
      move(fromIndex, toIndex);

      // Update order field for all items after the move
      const updatedItems = [...items];
      const [movedItem] = updatedItems.splice(fromIndex, 1);
      updatedItems.splice(toIndex, 0, movedItem);

      // Update order field for all items
      updatedItems.forEach((item, index) => {
        if (item.order !== index) {
          form.setValue(`images.${index}.order`, index);
        }
      });
    });

    return () => {
      swapyRef.current?.destroy();
    };
  }, []);

  const handleDelete = (index: number) => {
    remove(index);

    // Update order field for remaining items
    const remainingItems = fields.filter((_, i) => i !== index);
    remainingItems.forEach((_item, i) => {
      form.setValue(`images.${i}.order`, i);
    });
  };

  const handleSetFeatured = (index: number) => {
    // Set all images as not featured first
    items.forEach((_, i) => {
      form.setValue(`images.${i}.isFeatured`, false);
    });

    // Set the selected image as featured
    form.setValue(`images.${index}.isFeatured`, true);
  };

  return (
    <div ref={containerRef}>
      <div className="grid grid-cols-6 grid-rows-2 gap-1.5">
        {slottedItems.map(({ slotId, itemId, item }) => (
          <div
            className="aspect-4/3 rounded-md transition-colors first:col-span-2 first:row-span-2 data-[swapy-highlighted]:bg-muted/50"
            data-swapy-slot={slotId}
            key={slotId}
          >
            {item && (
              <div
                className="group relative flex size-full flex-col items-center justify-center overflow-hidden rounded-md bg-muted"
                data-swapy-item={itemId}
                key={itemId}
              >
                <span>{item.order}</span>

                {/* <div className="relative size-full select-none">
                  <Image
                    alt={`Product image ${item.order + 1}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    src={item.url}
                  />
                </div> */}

                {/* <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    className="h-8 w-8 p-0"
                    data-swapy-no-drag
                    onClick={() => handleSetFeatured(item.order)}
                    size="sm"
                    type="button"
                    variant={item.isFeatured ? "default" : "secondary"}
                  >
                    <Star className={`h-3 w-3 ${item.isFeatured ? "fill-current" : ""}`} />
                  </Button>

                  <Button
                    className="h-8 w-8 p-0"
                    data-swapy-no-drag
                    onClick={() => handleDelete(item.order)}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {item.isFeatured && (
                  <div className="absolute bottom-2 left-2 rounded bg-primary px-2 py-1 font-medium text-primary-foreground text-xs">
                    Featured
                  </div>
                )} */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
