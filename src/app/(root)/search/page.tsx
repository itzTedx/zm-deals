import { Suspense } from "react";
import type { Metadata } from "next";

import { env } from "@/lib/env/server";

import { SearchResults } from "./search-results";

type SearchParams = Promise<{ q: string | undefined }>;

export async function generateMetadata(searchParams: SearchParams): Promise<Metadata> {
  const query = (await searchParams).q || "";

  if (!query) {
    return {
      title: "Search Products",
      description: "Search for amazing deals and products on ZM Deals.",
    };
  }

  return {
    title: `Search Results for "${query}"`,
    description: `Find the best deals and products matching "${query}" on ZM Deals.`,
    keywords: [query, "search", "deals", "products", "discounts"],
    openGraph: {
      title: `Search Results for "${query}"`,
      description: `Find the best deals and products matching "${query}" on ZM Deals.`,
      url: `${env.BASE_URL}/search?q=${encodeURIComponent(query)}`,
      siteName: "ZM Deals",
      type: "website",
    },
    twitter: {
      title: `Search Results for "${query}"`,
      description: `Find the best deals and products matching "${query}" on ZM Deals.`,
    },
    alternates: {
      canonical: `${env.BASE_URL}/search?q=${encodeURIComponent(query)}`,
    },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = (await searchParams).q || "";

  return (
    <main className="container relative space-y-12 pt-9 pb-8 sm:pb-12 md:space-y-16 md:pb-16 lg:pb-20">
      {query && (
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} />
        </Suspense>
      )}
    </main>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="space-y-3" key={i}>
            <div className="aspect-square animate-pulse rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
