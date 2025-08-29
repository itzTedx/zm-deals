"use client";

import { useEffect, useState } from "react";

import { IconSearch, IconTrendingUp } from "@/assets/icons";

import { Button } from "../ui/button";

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onSelectSuggestion: (suggestion: string) => void;
}

const popularSearches = ["electronics", "home decor", "fashion", "books", "sports", "beauty", "kitchen", "garden"];

export function SearchSuggestions({ query, isVisible, onSelectSuggestion }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (query.trim().length > 0) {
      // Filter popular searches that match the query
      const filtered = popularSearches.filter((search) => search.toLowerCase().includes(query.toLowerCase()));
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border bg-background shadow-lg">
      <div className="p-2">
        {suggestions.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-2 px-2 py-1 font-medium text-muted-foreground text-xs">
              <IconSearch className="size-3" />
              Suggestions
            </div>
            {suggestions.map((suggestion) => (
              <Button
                className="w-full justify-start text-left"
                key={suggestion}
                onClick={() => onSelectSuggestion(suggestion)}
                variant="ghost"
              >
                <IconSearch className="mr-2 size-4" />
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 px-2 py-1 font-medium text-muted-foreground text-xs">
            <IconTrendingUp className="size-3" />
            Popular Searches
          </div>
          <div className="flex flex-wrap gap-1 p-2">
            {popularSearches.slice(0, 6).map((search) => (
              <Button
                className="text-xs"
                key={search}
                onClick={() => onSelectSuggestion(search)}
                size="sm"
                variant="outline"
              >
                {search}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
