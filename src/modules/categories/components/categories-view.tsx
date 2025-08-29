"use client";

import { useMemo, useState } from "react";

import { CategoriesGrid } from "@/modules/categories/components/categories-grid";
import { CategoriesTable } from "@/modules/categories/components/categories-table";
import { CreateButton } from "@/modules/categories/components/create-button";
import { SearchBar } from "@/modules/categories/components/search-bar";
import { ViewToggle } from "@/modules/categories/components/view-toggle";

import { CategoryWithRelations } from "../types";

interface CategoriesViewProps {
  categories: CategoryWithRelations[];
}

export function CategoriesView({ categories }: CategoriesViewProps) {
  const [view, setView] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories and organize your inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle onViewChange={setView} view={view} />
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

      <div className="rounded-lg border bg-card">
        {view === "table" ? (
          <CategoriesTable data={filteredCategories} />
        ) : (
          <div className="p-6">
            <CategoriesGrid data={filteredCategories} />
          </div>
        )}
      </div>
    </div>
  );
}
