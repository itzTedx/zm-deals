"use client";

import { LayoutGrid, Table } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  view: "table" | "cards";
  onViewChange: (view: "table" | "cards") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button
        className="h-8 w-8 p-0"
        onClick={() => onViewChange("cards")}
        size="sm"
        variant={view === "cards" ? "default" : "ghost"}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Card view</span>
      </Button>
      <Button
        className="h-8 w-8 p-0"
        onClick={() => onViewChange("table")}
        size="sm"
        variant={view === "table" ? "default" : "ghost"}
      >
        <Table className="h-4 w-4" />
        <span className="sr-only">Table view</span>
      </Button>
    </div>
  );
}
