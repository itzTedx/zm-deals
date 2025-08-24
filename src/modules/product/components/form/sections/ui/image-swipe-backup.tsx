import { useEffect, useMemo, useRef, useState } from "react";

import { createSwapy, SlotItemMapArray, Swapy, utils } from "swapy";

type Item = {
  id: string;
  title: string;
};

const initialItems: Item[] = [
  { id: "1", title: "1" },
  { id: "2", title: "2" },
  { id: "3", title: "3" },
];

let id = 4;

function App() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(utils.initSlotItemMap(items, "id"));
  const slottedItems = useMemo(() => utils.toSlottedItems(items, "id", slotItemMap), [items, slotItemMap]);
  const swapyRef = useRef<Swapy | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => utils.dynamicSwapy(swapyRef.current, items, "id", slotItemMap, setSlotItemMap), [items]);

  useEffect(() => {
    swapyRef.current = createSwapy(containerRef.current!, {
      manualSwap: true,
      animation: "dynamic",
      // autoScrollOnDrag: true,
      swapMode: "drop",
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    });

    swapyRef.current.onSwap((event) => {
      setSlotItemMap(event.newSlotItemMap.asArray);
    });

    return () => {
      swapyRef.current?.destroy();
    };
  }, []);
  return (
    <div ref={containerRef}>
      <div className="grid grid-cols-6 grid-rows-2 gap-1.5">
        {slottedItems.map(({ slotId, itemId, item }) => (
          <div
            className="aspect-4/3 rounded-md first:col-span-2 first:row-span-2 data-[swapy-highlighted]:bg-muted"
            data-swapy-slot={slotId}
            key={slotId}
          >
            {item && (
              <div
                className="relative flex size-full flex-col items-center justify-center rounded-md bg-[#4338ca] px-5"
                data-swapy-item={itemId}
                key={itemId}
              >
                <span>{item.title}</span>
                <span
                  className="delete"
                  data-swapy-no-drag
                  onClick={() => {
                    setItems(items.filter((i) => i.id !== item.id));
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        className="item item--add"
        onClick={() => {
          const newItem: Item = { id: `${id}`, title: `${id}` };
          setItems([...items, newItem]);
          id++;
        }}
      >
        +
      </div>
    </div>
  );
}

export default App;
