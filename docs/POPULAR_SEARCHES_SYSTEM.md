# Popular Searches System

This document outlines the implementation of the database-driven popular searches system for the ZM Deals project.

## Overview

The popular searches system replaces the hardcoded search suggestions with dynamic, algorithm-driven suggestions based on actual user search behavior. The system tracks search queries in the database and uses a sophisticated scoring algorithm to determine the most relevant and popular searches.

## Features

### Core Functionality
- **Database-Driven**: All popular searches come from actual user search data
- **Smart Algorithm**: Multi-factor scoring system for relevance
- **Time-Based Filtering**: Support for different time windows (24h, 7d, 30d, all)
- **Personalized Searches**: User-specific search suggestions
- **Trending Detection**: Identify searches gaining popularity
- **Fallback System**: Graceful degradation when database is unavailable

### Algorithm Components

The scoring algorithm considers three main factors:

1. **Search Count (40% weight)**: How many times a term has been searched
2. **Recency (30% weight)**: How recently it was searched (exponential decay)
3. **Trending (30% weight)**: Recent activity vs historical activity

### Scoring Formula

```
Score = (searchCountScore × 0.4) + (recencyScore × 0.3) + (trendingScore × 0.3)

Where:
- searchCountScore = min(searchCount / 10, 1)
- recencyScore = exp(-hoursSinceLastSearch / 168)
- trendingScore = min(searchesPerDay / 2, 1)
```

## Database Schema

### Search Histories Table

```sql
CREATE TABLE "search-histories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
  "query" varchar(255) NOT NULL UNIQUE,
  "search_count" integer DEFAULT 1 NOT NULL,
  "last_searched_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

**Indexes:**
- `searches_user_id_idx` - For user-based queries
- `searches_query_idx` - For query-based lookups
- `searches_search_count_idx` - For popularity sorting
- `searches_last_searched_at_idx` - For recency sorting
- `searches_created_at_idx` - For trending calculations

## Server Actions

### Core Functions

#### `getPopularSearches(options: PopularSearchesOptions)`

Retrieves popular searches using the scoring algorithm.

```typescript
const popularSearches = await getPopularSearches({
  limit: 8,
  timeWindow: "7d",
  minSearchCount: 2,
  excludeQueries: ["spam", "test"]
});
```

**Options:**
- `limit`: Number of searches to return (default: 8)
- `timeWindow`: Time period to consider ("24h", "7d", "30d", "all")
- `minSearchCount`: Minimum search count threshold (default: 2)
- `excludeQueries`: Array of queries to exclude

#### `getTrendingSearches(limit: number)`

Retrieves searches that are gaining popularity recently.

```typescript
const trendingSearches = await getTrendingSearches(6);
```

#### `getPersonalizedPopularSearches(userId: string, limit: number)`

Retrieves personalized searches based on user's search history.

```typescript
const personalizedSearches = await getPersonalizedPopularSearches(userId, 6);
```

#### `getSearchSuggestions(partialQuery: string, limit: number)`

Retrieves search suggestions based on partial query input.

```typescript
const suggestions = await getSearchSuggestions("elec", 5);
```

## React Components

### SearchSuggestions Component

Updated to use database-driven suggestions:

```tsx
import { SearchSuggestions } from "@/components/layout/search-suggestions";

<SearchSuggestions
  query={searchQuery}
  isVisible={showSuggestions}
  onSelectSuggestion={handleSuggestionSelect}
/>
```

### PopularSearches Component

New reusable component for displaying popular searches:

```tsx
import { PopularSearches } from "@/components/layout/popular-searches";

// Global popular searches
<PopularSearches type="popular" limit={6} />

// Trending searches
<PopularSearches type="trending" limit={4} />

// Personalized searches
<PopularSearches type="personalized" limit={6} />

// Custom time window
<PopularSearches timeWindow="24h" limit={8} />

// Custom click handler
<PopularSearches
  onSelectSearch={(search) => {
    // Custom logic
    router.push(`/search?q=${search}`);
  }}
/>
```

## React Hook

### usePopularSearches Hook

Custom hook for managing popular searches state:

```tsx
import { usePopularSearches } from "@/hooks/use-popular-searches";

function MyComponent() {
  const { searches, isLoading, error, refetch } = usePopularSearches({
    limit: 8,
    timeWindow: "7d",
    type: "popular"
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {searches.map(search => (
        <button key={search} onClick={() => handleSearch(search)}>
          {search}
        </button>
      ))}
    </div>
  );
}
```

## Usage Examples

### In Search Form

```tsx
// src/components/layout/search-form.tsx
import { SearchSuggestions } from "./search-suggestions";

export function SearchForm() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
      />
      <SearchSuggestions
        query={query}
        isVisible={showSuggestions}
        onSelectSuggestion={(suggestion) => {
          setQuery(suggestion);
          setShowSuggestions(false);
          // Navigate to search results
        }}
      />
    </div>
  );
}
```

### In Homepage

```tsx
// src/app/(root)/page.tsx
import { PopularSearches } from "@/components/layout/popular-searches";

export default function HomePage() {
  return (
    <div>
      <h2>Trending Searches</h2>
      <PopularSearches type="trending" limit={4} />
      
      <h2>Popular Categories</h2>
      <PopularSearches type="popular" limit={6} />
    </div>
  );
}
```

### In User Dashboard

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { PopularSearches } from "@/components/layout/popular-searches";

export default function DashboardPage() {
  return (
    <div>
      <h2>Your Recent Searches</h2>
      <PopularSearches type="personalized" limit={8} />
    </div>
  );
}
```

## Performance Considerations

### Caching Strategy

The system implements several caching strategies:

1. **Component-Level Caching**: React components cache popular searches in state
2. **Database Indexing**: Optimized indexes for fast queries
3. **Fallback System**: Graceful degradation with default searches

### Query Optimization

- Uses database indexes for efficient filtering and sorting
- Limits result sets to prevent performance issues
- Implements pagination for large datasets

### Error Handling

- Graceful fallback to default searches on database errors
- User-friendly error messages
- Logging for debugging and monitoring

## Configuration

### Environment Variables

No additional environment variables required beyond existing database configuration.

### Customization Options

#### Algorithm Weights

Modify the scoring weights in `getPopularSearches()`:

```typescript
// Current weights
const score = (searchCountScore * 0.4) + (recencyScore * 0.3) + (trendingScore * 0.3);

// Custom weights
const score = (searchCountScore * 0.5) + (recencyScore * 0.3) + (trendingScore * 0.2);
```

#### Time Windows

Add custom time windows:

```typescript
const timeWindows = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "all": null
};
```

#### Minimum Search Counts

Adjust thresholds based on your traffic:

```typescript
// For high-traffic sites
const minSearchCount = 5;

// For low-traffic sites
const minSearchCount = 1;
```

## Monitoring and Analytics

### Key Metrics

Track these metrics to monitor system performance:

1. **Search Volume**: Total searches per time period
2. **Popularity Distribution**: How searches are distributed
3. **Algorithm Performance**: Score distribution and ranking quality
4. **User Engagement**: Click-through rates on suggestions

### Logging

The system logs important events:

```typescript
// Search recording
console.log("Search recorded", { query, userId, timestamp });

// Algorithm scoring
console.log("Search scored", { query, score, factors });

// Error handling
console.error("Failed to fetch popular searches", error);
```

## Future Enhancements

### Planned Features

- [ ] **A/B Testing**: Test different algorithm weights
- [ ] **Machine Learning**: ML-based search ranking
- [ ] **Category-Based**: Popular searches by product category
- [ ] **Seasonal Trends**: Holiday and seasonal search patterns
- [ ] **Geographic Targeting**: Location-based popular searches
- [ ] **Real-time Updates**: WebSocket-based live updates

### Performance Improvements

- [ ] **Redis Caching**: Cache popular searches in Redis
- [ ] **Background Jobs**: Pre-compute popular searches
- [ ] **CDN Integration**: Serve popular searches via CDN
- [ ] **Database Sharding**: Scale search data across multiple databases

## Migration Guide

### From Hardcoded Searches

1. **Update Components**: Replace hardcoded arrays with database calls
2. **Add Error Handling**: Implement fallback to default searches
3. **Test Performance**: Monitor database query performance
4. **Gradual Rollout**: Deploy to subset of users first

### Database Migration

The search histories table is already created. If you need to migrate existing data:

```sql
-- Example: Migrate from old search table
INSERT INTO search-histories (query, search_count, last_searched_at)
SELECT query, count, last_searched_at FROM old_search_table;
```

## Troubleshooting

### Common Issues

1. **Empty Results**: Check if search data exists in database
2. **Slow Queries**: Verify database indexes are created
3. **High Memory Usage**: Reduce limit or implement pagination
4. **Inconsistent Results**: Check for timezone issues

### Debug Mode

Enable debug logging:

```typescript
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("Popular searches algorithm:", {
    searchData,
    scoredSearches,
    finalResults
  });
}
```

## Conclusion

The popular searches system provides a robust, scalable solution for dynamic search suggestions. The algorithm balances popularity, recency, and trending factors to deliver relevant results to users. The system is designed to be performant, maintainable, and extensible for future enhancements. 