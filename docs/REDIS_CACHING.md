# Redis Caching for Search Functionality

This document outlines the implementation of Redis caching for the search functionality in the ZM Deals project.

## Overview

The search functionality now uses Redis caching to improve performance and reduce database load. The caching system implements a cache-first strategy with intelligent cache invalidation and comprehensive monitoring capabilities.

## Architecture

### Cache Layers

1. **Search Cache Layer** (`src/lib/cache/search-cache.ts`)
   - Handles all search-related caching operations
   - Provides cache-first strategy with fallback to database
   - Implements intelligent cache invalidation

2. **Cache Management Layer** (`src/lib/cache/cache-manager.ts`)
   - Provides cache monitoring and management utilities
   - Offers cache statistics and performance metrics
   - Enables cache clearing and maintenance operations

3. **Admin Interface** (`src/components/admin/cache-management.tsx`)
   - Web-based cache management dashboard
   - Real-time cache statistics and monitoring
   - Cache clearing and maintenance operations

### Cache Categories

- **Popular Searches**: Cached for 15 minutes
- **Search Suggestions**: Cached for 10 minutes
- **Trending Searches**: Cached for 5 minutes
- **Personalized Searches**: Cached for 10 minutes
- **Search Results**: Cached for 5 minutes

## Implementation Details

### Cache Keys Structure

```
search:popular:{limit}:{timeWindow}:{minSearchCount}:{excludeQueries}
search:suggestions:{query}:{limit}
search:trending:{limit}
search:personalized:{userId}:{limit}
search:results:{query}:{limit}
```

### Cache Strategy

#### Cache-First Strategy
1. Check Redis cache for existing data
2. If cache hit, return cached data immediately
3. If cache miss, fetch from database
4. Store result in cache with appropriate TTL
5. Return data to client

#### Cache Invalidation
- **Automatic**: Cache is invalidated when new searches are performed
- **Pattern-based**: Related cache entries are invalidated using pattern matching
- **Selective**: Only relevant cache entries are cleared, preserving other data

### Performance Benefits

- **Reduced Database Load**: Frequently accessed search data is served from cache
- **Faster Response Times**: Cache hits provide sub-millisecond response times
- **Improved Scalability**: Redis can handle thousands of concurrent requests
- **Better User Experience**: Faster search suggestions and results

## Usage

### Basic Search Caching

The search functions automatically use caching:

```typescript
import { getPopularSearches, getSearchSuggestions } from "@/modules/product/actions/popular-searches";

// This will check cache first, then database if needed
const popularSearches = await getPopularSearches({ limit: 8, timeWindow: "7d" });

// Search suggestions are also cached
const suggestions = await getSearchSuggestions("electronics", 5);
```

### Product Search Caching

Product search results are cached automatically:

```typescript
import { searchProducts } from "@/modules/product/actions/query";

// Results are cached for 5 minutes
const results = await searchProducts("laptop", 20);
```

### Cache Management

#### Programmatic Cache Management

```typescript
import { 
  invalidateSearchCache, 
  clearSearchCache,
  getCacheStats 
} from "@/lib/cache/cache-manager";

// Invalidate all search cache
await invalidateSearchCache();

// Clear only search-related cache
const result = await clearSearchCache();

// Get cache statistics
const stats = await getCacheStats();
```

#### Admin Dashboard

Access the cache management dashboard at `/admin/cache` (admin users only):

- View cache statistics and performance metrics
- Monitor memory usage breakdown
- Clear specific cache categories
- View cache hit rates and performance

### React Hook for Cache Management

```typescript
import { useCacheManagement } from "@/hooks/use-cache-management";

function AdminComponent() {
  const {
    isLoading,
    error,
    getCacheStats,
    clearSearchCache,
    clearAllCache
  } = useCacheManagement();

  const handleClearCache = async () => {
    const result = await clearSearchCache();
    if (result.success) {
      console.log(`Cleared ${result.clearedKeys} cache keys`);
    }
  };

  return (
    <div>
      <button onClick={handleClearCache} disabled={isLoading}>
        Clear Search Cache
      </button>
    </div>
  );
}
```

## API Endpoints

### Cache Management API

#### GET `/api/admin/cache`
Get cache statistics and information.

**Query Parameters:**
- `action=stats` - Get general cache statistics
- `action=memory` - Get memory usage breakdown
- `action=performance` - Get performance metrics
- `action=keys&pattern=*` - Get cache keys matching pattern
- `action=key-info&key=search:popular:8:7d:2:` - Get specific key information

#### DELETE `/api/admin/cache`
Clear cache data.

**Query Parameters:**
- `type=search` - Clear only search-related cache
- `type=all` - Clear all cache data

**Example:**
```bash
# Clear search cache
curl -X DELETE "http://localhost:3000/api/admin/cache?type=search"

# Get cache statistics
curl "http://localhost:3000/api/admin/cache?action=stats"
```

## Configuration

### Environment Variables

The Redis configuration is already set up in the project:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Cache TTL Configuration

Cache TTL values can be adjusted in `src/lib/cache/search-cache.ts`:

```typescript
const CACHE_TTL = {
  POPULAR_SEARCHES: 15 * 60, // 15 minutes
  SEARCH_SUGGESTIONS: 10 * 60, // 10 minutes
  TRENDING_SEARCHES: 5 * 60, // 5 minutes
  PERSONALIZED_SEARCHES: 10 * 60, // 10 minutes
  SEARCH_RESULTS: 5 * 60, // 5 minutes
} as const;
```

## Monitoring and Maintenance

### Cache Statistics

The system provides comprehensive cache statistics:

- **Total Keys**: Number of keys in Redis
- **Search Keys**: Number of search-related keys
- **Memory Usage**: Total Redis memory usage
- **Hit Rate**: Cache hit percentage
- **Performance Metrics**: Requests, hits, misses

### Cache Performance Monitoring

Monitor cache performance through:

1. **Admin Dashboard**: Real-time metrics and statistics
2. **API Endpoints**: Programmatic access to cache data
3. **Redis CLI**: Direct Redis commands for debugging

### Cache Maintenance

#### Regular Maintenance Tasks

1. **Monitor Memory Usage**: Ensure Redis doesn't exceed memory limits
2. **Check Hit Rates**: Optimize cache TTL based on hit rates
3. **Clear Stale Data**: Periodically clear old cache entries
4. **Performance Tuning**: Adjust cache strategies based on usage patterns

#### Cache Warming

For high-traffic scenarios, consider implementing cache warming:

```typescript
// Warm up popular searches cache
async function warmUpCache() {
  const popularSearches = await getPopularSearches({ limit: 20 });
  const trendingSearches = await getTrendingSearches(10);
  
  console.log("Cache warmed up with popular and trending searches");
}
```

## Error Handling

### Graceful Degradation

The caching system implements graceful degradation:

1. **Cache Failures**: If Redis is unavailable, functions fall back to database queries
2. **Serialization Errors**: Invalid cache data is ignored and fresh data is fetched
3. **Connection Issues**: Temporary Redis connection issues don't break the application

### Error Logging

All cache operations include comprehensive error logging:

```typescript
try {
  const cachedData = await getCachedData(key);
  return cachedData;
} catch (error) {
  console.error("Failed to get cached data:", error);
  return null; // Fall back to database
}
```

## Best Practices

### Cache Key Design

- Use descriptive, hierarchical cache keys
- Include relevant parameters in cache keys
- Normalize cache keys (lowercase, consistent formatting)

### TTL Management

- Set appropriate TTL based on data freshness requirements
- Use shorter TTL for frequently changing data
- Consider implementing cache warming for critical data

### Memory Management

- Monitor Redis memory usage regularly
- Set appropriate memory limits
- Implement cache eviction policies if needed

### Performance Optimization

- Use cache-first strategy for read-heavy operations
- Implement intelligent cache invalidation
- Monitor cache hit rates and adjust strategies accordingly

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check cache TTL settings
   - Monitor cache key patterns
   - Consider implementing cache eviction

2. **Low Hit Rates**
   - Review cache key design
   - Check cache invalidation patterns
   - Analyze user search patterns

3. **Cache Inconsistency**
   - Verify cache invalidation logic
   - Check for race conditions
   - Review cache update strategies

### Debugging Tools

1. **Redis CLI**: Direct access to Redis data
2. **Admin Dashboard**: Web-based cache monitoring
3. **API Endpoints**: Programmatic cache inspection
4. **Application Logs**: Detailed error and performance logging

## Future Enhancements

### Planned Improvements

1. **Advanced Caching Strategies**
   - Implement cache warming for popular searches
   - Add cache compression for large datasets
   - Implement cache partitioning for better performance

2. **Enhanced Monitoring**
   - Real-time cache performance alerts
   - Automated cache optimization recommendations
   - Integration with external monitoring tools

3. **Cache Analytics**
   - Detailed cache usage analytics
   - User behavior-based cache optimization
   - Predictive cache warming

4. **Distributed Caching**
   - Redis cluster support for high availability
   - Multi-region cache distribution
   - Cache synchronization across instances

## Conclusion

The Redis caching implementation provides significant performance improvements for the search functionality while maintaining data consistency and providing comprehensive monitoring capabilities. The system is designed to be robust, scalable, and maintainable, with clear separation of concerns and comprehensive error handling. 