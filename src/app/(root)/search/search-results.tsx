import { SearchForm } from "@/components/layout/search-form";
import { SeparatorBox } from "@/components/ui/separator";

import { IconSearch } from "@/assets/icons";

import { pluralize } from "@/lib/functions/pluralize";
import { searchProducts } from "@/modules/product/actions/query";
import { ProductCard } from "@/modules/product/components/product-card";

interface SearchResultsProps {
  query: string;
}

export async function SearchResults({ query }: SearchResultsProps) {
  const results = await searchProducts(query, 50);

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        {results.length} {pluralize("result", results.length)} for "{query}"
      </div>
      <SeparatorBox />
      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard data={product} key={product.id} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <IconSearch className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-semibold text-lg">No results found</h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            We couldn't find any products matching "{query}". Try adjusting your search terms or browse our categories.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchForm defaultValue={query} placeholder="Try a different search..." />
          </div>
        </div>
      )}
    </div>
  );
}
