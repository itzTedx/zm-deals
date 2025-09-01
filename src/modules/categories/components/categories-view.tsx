"use client";

import { useMemo, useState } from "react";

import { parseAsStringEnum, useQueryState } from "nuqs";

import { CategoriesGrid } from "@/modules/categories/components/categories-grid";
import { CategoriesTable } from "@/modules/categories/components/categories-table";
import { CreateButton } from "@/modules/categories/components/create-button";
import { SearchBar } from "@/modules/categories/components/search-bar";
import { ViewToggle } from "@/modules/categories/components/view-toggle";

import { CategoryData } from "../types";

interface CategoriesViewProps {
  categories: CategoryData[];
}

type View = "table" | "cards";

export function CategoriesView({ categories }: CategoriesViewProps) {
  const [view, setView] = useQueryState("view", parseAsStringEnum<View>(["table", "cards"]).withDefault("cards"));
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description && category.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  return (
    <div className="container flex w-full flex-col gap-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories and organize your inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle onViewChange={handleViewChange} view={view || "cards"} />
          <CreateButton />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="max-w-sm flex-1">
          <SearchBar onChange={setSearchQuery} value={searchQuery} />
        </div>
        <div className="text-muted-foreground text-sm">
          {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      {view === "table" ? (
        <div className="rounded-lg border bg-card">
          <CategoriesTable data={filteredCategories} />
        </div>
      ) : (
        <CategoriesGrid data={filteredCategories} />
      )}
    </div>
  );
}
