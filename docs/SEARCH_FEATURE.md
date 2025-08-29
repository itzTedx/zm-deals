# Search Feature Documentation

## Overview

The search feature provides comprehensive product search functionality across the ZM Deals platform. It includes text search, autocomplete suggestions, and advanced filtering capabilities.

## Features

### Core Search Functionality
- **Text Search**: Search across product titles, descriptions, and overviews
- **Autocomplete**: Real-time search suggestions with popular searches
- **Advanced Filtering**: Filter by category, price range, and featured status
- **Responsive Design**: Mobile-first design with touch-friendly interface
- **SEO Optimized**: Proper metadata and URL structure for search engines

### Search Components

#### 1. SearchForm Component
Located at `src/components/layout/search-form.tsx`

**Features:**
- Form submission with URL navigation
- Autocomplete suggestions
- Keyboard navigation support
- Click outside to close suggestions

**Usage:**
```tsx
import { SearchForm } from "@/components/layout/search-form";

// Basic usage
<SearchForm />

// With custom props
<SearchForm 
  placeholder="Search for deals..."
  defaultValue="electronics"
  showSuggestions={true}
/>
```

#### 2. SearchSuggestions Component
Located at `src/components/layout/search-suggestions.tsx`

**Features:**
- Dynamic suggestions based on query
- Popular searches display
- Click to select functionality

#### 3. SearchResults Component
Located at `src/app/(root)/search/search-results.tsx`

**Features:**
- Displays search results in grid layout
- Result count display
- Empty state handling
- Refine search functionality

## Search Actions

### Basic Search
```typescript
import { searchProducts } from "@/modules/product/actions/query";

const results = await searchProducts("electronics", 20);
```

### Advanced Search
```typescript
import { advancedSearchProducts } from "@/modules/product/actions/query";

const results = await advancedSearchProducts({
  query: "laptop",
  categoryId: "category-uuid",
  minPrice: 100,
  maxPrice: 1000,
  isFeatured: true,
  limit: 50
});
```

## Database Schema

### Search Indexes
The following indexes have been added to optimize search performance:

```sql
-- Text search indexes
CREATE INDEX products_title_search_idx ON products(title);
CREATE INDEX products_description_search_idx ON products(description);
CREATE INDEX products_overview_search_idx ON products(overview);
```

### Search Query Structure
```sql
SELECT * FROM products 
WHERE status = 'published'
AND (
  title ILIKE '%search_term%' OR
  description ILIKE '%search_term%' OR
  overview ILIKE '%search_term%'
)
ORDER BY is_featured DESC, created_at DESC
LIMIT 20;
```

## URL Structure

### Search Page
- **URL**: `/search?q=search_term`
- **Example**: `/search?q=electronics`

### URL Parameters
- `q`: Search query (required for results)
- Additional parameters can be added for advanced filtering

## Implementation Details

### Search Flow
1. User types in search input
2. Search suggestions appear (if enabled)
3. User submits search or selects suggestion
4. Navigation to `/search?q=query`
5. Server fetches results using `searchProducts()`
6. Results displayed in responsive grid

### Performance Optimizations
- Database indexes on searchable fields
- Server-side rendering for SEO
- Lazy loading of search results
- Debounced search suggestions
- Efficient query building with Drizzle ORM

### Error Handling
- Empty query validation
- Database error handling
- Network error fallbacks
- Graceful degradation for missing data

## Usage Examples

### In Navbar
The search form is integrated into the main navigation:

```tsx
// src/components/layout/navbar.tsx
<div className="mx-auto max-w-sm flex-1 sm:max-w-md">
  <SearchForm />
</div>
```

### In Sidebar
Search form is also available in the sidebar:

```tsx
// src/components/layout/sidebar/search-bar.tsx
<SearchForm placeholder="Search for products..." />
```

### Custom Search Page
```tsx
// Custom search implementation
export default async function CustomSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";
  const results = query ? await searchProducts(query) : [];
  
  return (
    <div>
      <SearchForm defaultValue={query} />
      <SearchResults query={query} />
    </div>
  );
}
```

## Configuration

### Environment Variables
No additional environment variables required beyond existing database configuration.

### Customization Options

#### Popular Searches
Edit the `popularSearches` array in `search-suggestions.tsx`:

```typescript
const popularSearches = [
  "electronics",
  "home decor", 
  "fashion",
  "books",
  "sports",
  "beauty",
  "kitchen",
  "garden",
];
```

#### Search Limits
Modify the default limit in search functions:

```typescript
// Default limit is 20, can be customized
const results = await searchProducts(query, 50);
```

## Testing

### Manual Testing
1. Navigate to the homepage
2. Type in the search bar
3. Verify suggestions appear
4. Submit search and verify results
5. Test with empty queries
6. Test with special characters

### Search Scenarios
- **Basic Search**: "electronics" → should return electronics products
- **Partial Match**: "lap" → should return laptops and related items
- **Case Insensitive**: "LAPTOP" → should return same as "laptop"
- **Empty Search**: "" → should show search page without results
- **No Results**: "xyz123" → should show empty state

## Future Enhancements

### Planned Features
- [ ] Search result highlighting
- [ ] Search filters (price, category, rating)
- [ ] Search analytics and trending
- [ ] Voice search integration
- [ ] Search result pagination
- [ ] Search history
- [ ] Related searches
- [ ] Search result sorting options

### Performance Improvements
- [ ] Full-text search with PostgreSQL
- [ ] Search result caching
- [ ] Elasticsearch integration
- [ ] Search result ranking improvements
- [ ] Search suggestion ML model

## Troubleshooting

### Common Issues

#### Search Not Working
1. Check database connectivity
2. Verify search indexes are created
3. Check for JavaScript errors in console
4. Verify search action is properly exported

#### No Search Results
1. Verify products exist in database
2. Check product status is "published"
3. Verify search query format
4. Check database query logs

#### Suggestions Not Appearing
1. Check `showSuggestions` prop is true
2. Verify click outside handler
3. Check for CSS z-index issues
4. Verify event handlers are working

## Support

For issues with the search feature:
1. Check the browser console for errors
2. Verify database indexes are created
3. Test with simple search terms
4. Check network requests in dev tools
5. Review search action logs 