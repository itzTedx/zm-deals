# User Behavior Analysis for Recommendations

This document outlines the implementation of user behavior analysis for personalized product recommendations in the ZM Deals project.

## Overview

The user behavior analysis system tracks and analyzes user interactions to provide personalized product recommendations. It includes:

- **Recently Viewed Products**: Tracks products users have viewed
- **Purchase History**: Analyzes products users have purchased
- **Wishlist Items**: Considers products in user's wishlist
- **Personalized Recommendations**: Combines multiple data sources for recommendations

## Database Schema

### Recently Viewed Products Table

```sql
CREATE TABLE "recently_viewed" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
  "session_id" text,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "viewed_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Indexes:**
- `recently_viewed_user_id_idx` - For user-based queries
- `recently_viewed_session_id_idx` - For anonymous user queries
- `recently_viewed_product_id_idx` - For product-based queries
- `recently_viewed_viewed_at_idx` - For chronological ordering
- `recently_viewed_user_viewed_at_idx` - Composite index for user queries
- `recently_viewed_session_viewed_at_idx` - Composite index for session queries

## Features

### 1. Recently Viewed Products

#### Server Actions

```typescript
// Record a product view
await recordProductView(productId, sessionId?);

// Get recently viewed products for authenticated user
const products = await getRecentlyViewedProducts(limit, excludeProductIds);

// Get recently viewed products for anonymous user
const products = await getRecentlyViewedProductsBySession(sessionId, limit, excludeProductIds);

// Clear recently viewed products
await clearRecentlyViewedProducts();

// Remove specific product from recently viewed
await removeFromRecentlyViewed(productId);
```

#### Client-Side Tracking

```typescript
// React hook for automatic tracking
import { useProductView } from "@/modules/product/hooks/use-product-view";

function ProductPage({ productId }: { productId: string }) {
  useProductView(productId);
  
  return <div>Product content...</div>;
}

// Manual tracking
import { trackProductView } from "@/modules/product/actions/product-view";

await trackProductView(productId);
```

### 2. Purchase History Analysis

#### Server Actions

```typescript
// Get products from purchase history
const products = await getPurchaseHistoryProducts(limit, excludeProductIds);

// Get categories from purchase history
const categories = await getPurchaseHistoryCategories();

// Get products similar to purchased items
const products = await getSimilarToPurchasedProducts(limit, excludeProductIds);

// Get price range from purchase history
const priceRange = await getPurchaseHistoryPriceRange();
```

### 3. Wishlist Analysis

#### Server Actions

```typescript
// Get products from wishlist
const products = await getWishlistProducts(limit, excludeProductIds);

// Get categories from wishlist
const categories = await getWishlistCategories();

// Get products similar to wishlist items
const products = await getSimilarToWishlistProducts(limit, excludeProductIds);

// Get price range from wishlist
const priceRange = await getWishlistPriceRange();

// Get products in similar price range to wishlist
const products = await getWishlistPriceBasedProducts(limit, excludeProductIds);
```

### 4. Personalized Recommendations

#### Server Actions

```typescript
// Get personalized recommendations
const products = await getPersonalizedRecommendations({
  limit: 8,
  excludeProductIds: [],
});
```

The personalized recommendations combine multiple strategies with weights:

- **Recently Viewed** (30%): Products the user has recently viewed
- **Similar to Purchased** (30%): Products similar to what the user has bought
- **Similar to Wishlist** (20%): Products similar to wishlist items
- **Purchase History** (10%): Products from user's purchase history
- **Wishlist Items** (10%): Products currently in user's wishlist

## Usage Examples

### Product Page Integration

```typescript
// In a product page component
import { useProductView } from "@/modules/product/hooks/use-product-view";

export default function ProductPage({ product }: { product: Product }) {
  // Track product view when page loads
  useProductView(product.id);
  
  return (
    <div>
      <h1>{product.title}</h1>
      {/* Product content */}
    </div>
  );
}
```

### Recommendations Component

```typescript
// In a recommendations component
import { getPersonalizedRecommendations } from "@/modules/product/actions/recommendations";

export default async function PersonalizedRecommendations() {
  const products = await getPersonalizedRecommendations({
    limit: 8,
    excludeProductIds: [],
  });
  
  return (
    <div>
      <h2>Recommended for You</h2>
      <ProductGrid products={products} />
    </div>
  );
}
```

### Anonymous User Support

The system supports anonymous users by using session IDs stored in localStorage:

```typescript
// Session ID is automatically managed
import { getAnonymousSessionId } from "@/modules/product/actions/product-view";

const sessionId = getAnonymousSessionId();
```

## Performance Considerations

1. **Database Indexing**: All queries use proper indexes for optimal performance
2. **Caching**: Consider implementing Redis caching for frequently accessed data
3. **Batch Operations**: Multiple product views can be batched for efficiency
4. **Cleanup**: Old view records can be cleaned up periodically

## Privacy and Security

1. **User Consent**: Ensure users consent to behavior tracking
2. **Data Retention**: Implement data retention policies
3. **Anonymization**: Anonymous users are tracked via session IDs only
4. **GDPR Compliance**: Provide options to clear user data

## Future Enhancements

1. **Machine Learning**: Implement ML-based recommendation algorithms
2. **Real-time Updates**: Update recommendations based on real-time user actions
3. **A/B Testing**: Test different recommendation strategies
4. **Seasonal Recommendations**: Time-based recommendation strategies
5. **Social Recommendations**: Recommendations based on friends' behavior
6. **Cross-platform Tracking**: Track behavior across different devices

## Error Handling

All functions include proper error handling:

```typescript
try {
  const products = await getPersonalizedRecommendations(options);
  return products;
} catch (error) {
  console.error("Failed to get personalized recommendations:", error);
  // Fallback to featured products
  return getFeaturedRecommendations(options);
}
```

## Testing

Test the system with:

1. **Authenticated Users**: Verify personalized recommendations work
2. **Anonymous Users**: Ensure session-based tracking works
3. **Edge Cases**: Test with empty data, invalid IDs, etc.
4. **Performance**: Test with large datasets
5. **Privacy**: Verify data is properly isolated between users 