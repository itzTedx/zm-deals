"use client";

import { useEffect, useState } from "react";

import { IconSearch, IconTrendingUp } from "@/assets/icons";

import { getPopularSearches, getSearchSuggestions } from "@/modules/product/actions/popular-searches";

import { Button } from "../ui/button";

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onSelectSuggestion: (suggestion: string) => void;
}

export function SearchSuggestions({ query, isVisible, onSelectSuggestion }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load popular searches on component mount
  useEffect(() => {
    async function loadPopularSearches() {
      try {
        const searches = await getPopularSearches({ limit: 8 });
        setPopularSearches(searches);
      } catch (error) {
        console.error("Failed to load popular searches:", error);
        // Fallback to default searches if database fails
        setPopularSearches(["electronics", "home decor", "fashion", "books", "sports", "beauty", "kitchen", "garden"]);
      }
    }

    loadPopularSearches();
  }, []);

  // Load search suggestions based on query
  useEffect(() => {
    async function loadSuggestions() {
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const dbSuggestions = await getSearchSuggestions(query, 5);
          if (dbSuggestions.length > 0) {
            setSuggestions(dbSuggestions);
          } else {
            // Fallback to filtering popular searches if no database suggestions
            const filtered = popularSearches.filter((search) => search.toLowerCase().includes(query.toLowerCase()));
            setSuggestions(filtered.slice(0, 5));
          }
        } catch (error) {
          console.error("Failed to load search suggestions:", error);
          // Fallback to filtering popular searches
          const filtered = popularSearches.filter((search) => search.toLowerCase().includes(query.toLowerCase()));
          setSuggestions(filtered.slice(0, 5));
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }

    loadSuggestions();
  }, [query, popularSearches]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border bg-card shadow-xl">
      <div className="p-2">
        {suggestions.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-2 px-2 py-1 font-medium text-muted-foreground text-xs">
              <IconSearch className="size-3" />
              {isLoading ? "Loading..." : "Suggestions"}
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
