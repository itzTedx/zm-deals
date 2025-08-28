# Product Recommendation System

This module provides a sophisticated product recommendation system with multiple strategies and components for displaying recommendations throughout the application.

## Features

- **Multiple Recommendation Strategies**: Category-based, price-based, rating-based, featured, and hybrid approaches
- **Personalized Recommendations**: User behavior-based recommendations (future enhancement)
- **Trending Products**: Popular products based on reviews and activity
- **Flexible Components**: Server-side and client-side components for different use cases
- **Performance Optimized**: Efficient database queries with proper indexing

## Recommendation Strategies

### 1. Hybrid (Default)
Combines multiple strategies with weighted scoring:
- Category-based (40% weight)
- Price-based (20% weight)
- Rating-based (20% weight)
- Featured (20% weight)

### 2. Category-based
Recommends products from the same categories as items in the user's cart.

### 3. Price-based
Recommends products in a similar price range (±30% of cart average).

### 4. Rating-based
Recommends highly-rated products with good review counts.

### 5. Featured
Recommends featured/promoted products.

### 6. Personalized
User behavior-based recommendations (requires user authentication).

### 7. Trending
Popular products based on reviews and activity metrics.

## Components

### Server Components

#### `RecommendedProducts`
Basic server-side component for displaying recommendations.

```tsx
import { RecommendedProducts } from "@/modules/product/components";

<RecommendedProducts
  cartProductIds={cartProductIds}
  title="Related Products"
  description="You might also like these products"
  strategy="hybrid"
  limit={8}
/>
```

#### `ProductRecommendations`
Advanced server-side component with more options.

```tsx
import { ProductRecommendations } from "@/modules/product/components";

<ProductRecommendations
  currentProductId={product.id}
  cartProductIds={cartProductIds}
  title="You Might Also Like"
  strategy="category"
  limit={4}
  variant="compact"
/>
```

### Client Components

#### `ClientRecommendations`
Interactive client-side component with loading states.

```tsx
import { ClientRecommendations } from "@/modules/product/components";

<ClientRecommendations
  cartProductIds={cartProductIds}
  currentProductId={product.id}
  title="Recommended for You"
  strategy="personalized"
  limit={6}
/>
```

## Usage Examples

### Cart Page Recommendations
```tsx
// In cart page
const cartProductIds = cartItems.map(item => item.product.id);

<RecommendedProducts
  cartProductIds={cartProductIds}
  title="Related Products"
  description="You might also like these products"
  strategy="hybrid"
  limit={8}
/>
```

### Product Detail Page Recommendations
```tsx
// In product detail page
<ProductRecommendations
  currentProductId={product.id}
  cartProductIds={cartProductIds}
  title="You Might Also Like"
  description="Discover more amazing deals"
  strategy="category"
  limit={4}
  variant="compact"
/>
```

### Homepage Trending Products
```tsx
// On homepage
<RecommendedProducts
  title="Trending Now"
  description="Most popular deals this week"
  strategy="trending"
  limit={6}
/>
```

### Personalized Recommendations
```tsx
// For authenticated users
<ClientRecommendations
  title="Recommended for You"
  description="Based on your preferences"
  strategy="personalized"
  limit={8}
/>
```

## API Usage

### Server Actions
```tsx
import { getRecommendedProducts } from "@/modules/product/actions/recommendations";

const recommendations = await getRecommendedProducts(cartProductIds, {
  limit: 8,
  strategy: "hybrid",
  excludeProductIds: [currentProductId],
});
```

### API Route
```tsx
// POST /api/recommendations
const response = await fetch("/api/recommendations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cartProductIds: ["id1", "id2"],
    currentProductId: "current-id",
    limit: 8,
    strategy: "hybrid",
  }),
});

const { products } = await response.json();
```

## Custom Hook

### `useRecommendations`
Client-side hook for interactive recommendations.

```tsx
import { useRecommendations } from "@/modules/product/hooks/use-recommendations";

function MyComponent() {
  const { products, isLoading, error, refetch } = useRecommendations({
    cartProductIds: ["id1", "id2"],
    currentProductId: "current-id",
    limit: 8,
    strategy: "hybrid",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} data={product} />
      ))}
    </div>
  );
}
```

## Configuration Options

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cartProductIds` | `string[]` | `[]` | Product IDs in user's cart |
| `currentProductId` | `string` | `undefined` | Current product ID to exclude |
| `title` | `string` | `"Recommended Products"` | Section title |
| `description` | `string` | `"You might also like these products"` | Section description |
| `limit` | `number` | `8` | Number of products to show |
| `strategy` | `string` | `"hybrid"` | Recommendation strategy |
| `showHeader` | `boolean` | `true` | Show section header |
| `className` | `string` | `""` | Additional CSS classes |
| `variant` | `string` | `"default"` | Layout variant |

### Strategy Options

- `"hybrid"` - Combined approach (default)
- `"category"` - Category-based
- `"price"` - Price-based
- `"rating"` - Rating-based
- `"featured"` - Featured products
- `"personalized"` - User behavior-based
- `"trending"` - Popular products

### Variant Options

- `"default"` - Standard grid layout
- `"compact"` - Tighter spacing
- `"horizontal"` - Horizontal layout

## Performance Considerations

1. **Database Indexing**: Ensure proper indexes on product tables
2. **Caching**: Consider implementing Redis caching for recommendations
3. **Pagination**: Use limit parameter to control result size
4. **Lazy Loading**: Use client components for dynamic recommendations

## Future Enhancements

1. **Machine Learning**: Implement ML-based recommendation algorithms
2. **User Behavior Tracking**: Track views, clicks, and purchases
3. **A/B Testing**: Test different recommendation strategies
4. **Real-time Updates**: Update recommendations based on user actions
5. **Seasonal Recommendations**: Time-based recommendation strategies

## Database Schema Requirements

The recommendation system requires the following database tables and relationships:

- `products` - Product information
- `categories` - Product categories
- `reviews` - Product reviews and ratings
- `carts` - User cart information
- `cart_items` - Cart items

Ensure proper indexes are created for optimal performance:

```sql
-- Example indexes for recommendations
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
``` 