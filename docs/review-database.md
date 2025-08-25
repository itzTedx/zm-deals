# Review Database Implementation

This document outlines the complete review database implementation for the ZM Deals project.

## Overview

The review system allows users to create, read, update, and delete reviews for products. It includes:

- Database schema with proper relations
- Server actions for CRUD operations
- Type conversion utilities
- Validation schemas
- UI components integration

## Database Schema

### Reviews Table

```sql
CREATE TABLE "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "rating" integer NOT NULL,
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);
```

### Relations

- **Product**: One-to-many relationship with products table
- **User**: One-to-many relationship with users table
- **Cascade Delete**: Reviews are deleted when product or user is deleted

### Indexes

- `reviews_product_id_idx` - For efficient product review queries
- `reviews_user_id_idx` - For efficient user review queries
- `reviews_rating_idx` - For rating-based queries
- `reviews_created_at_idx` - For chronological ordering

## Type Definitions

### Database Types

```typescript
// From src/server/schema/review-schema.ts
export type NewReview = typeof reviews.$inferInsert;
export type Review = typeof reviews.$inferSelect;
```

### Component Types

```typescript
// From src/modules/product/types.ts
export interface Review {
  id: string;
  name: string;
  rating: number;
  date: Date;
  comment: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
```

## Validation Schemas

### Create Review Schema

```typescript
export const reviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment must be less than 1000 characters"),
});
```

### Update Review Schema

```typescript
export const updateReviewSchema = z.object({
  id: z.string().uuid("Invalid review ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment must be less than 1000 characters"),
});
```

## Server Actions

### Query Actions

Located in `src/modules/product/actions/query.ts`:

#### `getProductReviews(productId: string, limit?: number)`

Fetches reviews for a specific product with optional limit.

```typescript
const reviews = await getProductReviews("product-uuid", 10);
```

#### `getUserReview(productId: string, userId: string)`

Fetches a specific user's review for a product.

```typescript
const userReview = await getUserReview("product-uuid", "user-uuid");
```

#### `getReviewStats(productId: string)`

Calculates review statistics for a product.

```typescript
const stats = await getReviewStats("product-uuid");
// Returns: { averageRating, totalReviews, ratingDistribution }
```

### Mutation Actions

Located in `src/modules/product/actions/mutation.ts`:

#### `createReview(rawData: unknown)`

Creates a new review. Requires authentication.

```typescript
const result = await createReview({
  productId: "product-uuid",
  rating: 5,
  comment: "Great product!"
});
```

**Features:**
- Validates user authentication
- Prevents duplicate reviews from same user
- Validates product existence
- Returns success/error response

#### `updateReview(rawData: unknown)`

Updates an existing review. Requires authentication and ownership.

```typescript
const result = await updateReview({
  id: "review-uuid",
  rating: 4,
  comment: "Updated comment"
});
```

**Features:**
- Validates user authentication
- Ensures user owns the review
- Updates rating and comment
- Returns success/error response

#### `deleteReview(reviewId: string)`

Soft deletes a review. Requires authentication and ownership.

```typescript
const result = await deleteReview("review-uuid");
```

**Features:**
- Validates user authentication
- Ensures user owns the review
- Soft delete (sets deletedAt timestamp)
- Returns success/error response

## Helper Functions

Located in `src/modules/product/actions/helper.ts`:

### `convertDatabaseReviewToComponentReview(dbReview)`

Converts database review to component review format.

### `convertDatabaseReviewsToComponentReviews(dbReviews)`

Converts array of database reviews to component reviews.

### `calculateAverageRating(reviews)`

Calculates average rating from review array.

### `getRatingDistribution(reviews)`

Calculates rating distribution from review array.

## Usage Examples

### 1. Display Reviews on Product Page

```typescript
// In your product page component
import { getProductBySlug } from "@/modules/product/actions/query";
import { convertDatabaseReviewsToComponentReviews } from "@/modules/product/actions/helper";

const product = await getProductBySlug(slug);
const reviews = convertDatabaseReviewsToComponentReviews(product.reviews);

return <Reviews reviews={reviews} productId={product.id} />;
```

### 2. Create a Review Form

```typescript
"use client";
import { createReview } from "@/modules/product/actions/mutation";

const handleSubmit = async (data) => {
  const result = await createReview({
    productId: "product-uuid",
    rating: data.rating,
    comment: data.comment
  });
  
  if (result.success) {
    toast.success("Review submitted successfully!");
  } else {
    toast.error(result.message);
  }
};
```

### 3. Display Review Statistics

```typescript
import { getReviewStats } from "@/modules/product/actions/query";

const stats = await getReviewStats(productId);

return (
  <div>
    <p>Average Rating: {stats.averageRating}/5</p>
    <p>Total Reviews: {stats.totalReviews}</p>
    <div>
      {Object.entries(stats.ratingDistribution).map(([rating, count]) => (
        <div key={rating}>
          {rating} stars: {count} reviews
        </div>
      ))}
    </div>
  </div>
);
```

## Security Features

1. **Authentication Required**: All mutation operations require user authentication
2. **Ownership Validation**: Users can only edit/delete their own reviews
3. **Input Validation**: All inputs are validated using Zod schemas
4. **SQL Injection Protection**: Uses Drizzle ORM with parameterized queries
5. **Soft Deletes**: Reviews are soft deleted to maintain data integrity

## Performance Optimizations

1. **Database Indexes**: Optimized indexes for common query patterns
2. **Pagination Support**: Limit parameter for large review sets
3. **Efficient Queries**: Uses Drizzle's optimized query builder
4. **Caching**: Reviews are fetched with product data in single query

## Error Handling

All server actions return consistent error responses:

```typescript
{
  success: boolean;
  message: string;
}
```

Common error scenarios:
- Unauthorized access
- Invalid input data
- Product not found
- Review not found
- Duplicate review attempt
- Database errors

## Testing

Visit `/test-reviews` to see a demonstration of the review database functionality.

## Migration

The reviews table migration is already included in `src/server/migrations/0004_skinny_darkhawk.sql`.

To run migrations:
```bash
pnpm db:migrate
```

## Future Enhancements

1. **Review Moderation**: Admin approval system
2. **Review Helpfulness**: Upvote/downvote system
3. **Review Images**: Allow users to attach images
4. **Review Replies**: Allow sellers to respond to reviews
5. **Review Analytics**: Advanced statistics and reporting
6. **Review Export**: Export reviews for analysis
7. **Review Search**: Search within reviews
8. **Review Filtering**: Filter by rating, date, etc. 