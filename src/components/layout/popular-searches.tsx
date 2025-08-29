"use client";

import { IconTrendingUp } from "@/assets/icons";

import { usePopularSearches } from "@/hooks/use-popular-searches";

import { Button } from "../ui/button";

interface PopularSearchesProps {
  limit?: number;
  timeWindow?: "24h" | "7d" | "30d" | "all";
  type?: "popular" | "trending" | "personalized";
  onSelectSearch?: (search: string) => void;
  showTitle?: boolean;
  className?: string;
}

export function PopularSearches({
  limit = 6,
  timeWindow = "7d",
  type = "popular",
  onSelectSearch,
  showTitle = true,
  className = "",
}: PopularSearchesProps) {
  const { searches, isLoading, error } = usePopularSearches({
    limit,
    timeWindow,
    type,
  });

  if (isLoading) {
    return (
      <div className={`flex flex-wrap gap-1 p-2 ${className}`}>
        {Array.from({ length: limit }).map((_, i) => (
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" key={i} />
        ))}
      </div>
    );
  }

  if (error || searches.length === 0) {
    return null;
  }

  const handleSearchClick = (search: string) => {
    if (onSelectSearch) {
      onSelectSearch(search);
    } else {
      // Default behavior: navigate to search page
      window.location.href = `/search?q=${encodeURIComponent(search)}`;
    }
  };

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 px-2 py-1 font-medium text-muted-foreground text-xs">
          <IconTrendingUp className="size-3" />
          {type === "trending" ? "Trending Searches" : type === "personalized" ? "Your Searches" : "Popular Searches"}
        </div>
      )}
      <div className="flex flex-wrap gap-1 p-2">
        {searches.map((search) => (
          <Button
            className="text-xs"
            key={search}
            onClick={() => handleSearchClick(search)}
            size="sm"
            variant="outline"
          >
            {search}
          </Button>
        ))}
      </div>
    </div>
  );
}
