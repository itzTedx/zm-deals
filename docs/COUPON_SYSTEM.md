# Coupon Management System

A complete coupon management system for ZM Deals e-commerce platform built with Next.js 15, TypeScript, Drizzle ORM, and PostgreSQL.

## Features

- ✅ **Complete CRUD Operations**: Create, read, update, and delete coupons
- ✅ **Advanced Validation**: Date ranges, usage limits, minimum order amounts
- ✅ **Multiple Discount Types**: Percentage and fixed amount discounts
- ✅ **Admin Dashboard**: Full-featured management interface
- ✅ **Real-time Validation**: Instant coupon validation during checkout
- ✅ **Transaction Safety**: Race condition prevention with database transactions
- ✅ **Soft Deletes**: Safe deletion with deactivation instead of hard delete
- ✅ **Search & Filtering**: Advanced filtering by status, date, and search terms
- ✅ **Responsive Design**: Mobile-first design with Tailwind CSS

## Database Schema

### Coupons Table

```sql
CREATE TABLE "coupons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL UNIQUE,
  "discount_type" "discount_type" NOT NULL, -- 'percentage' | 'fixed'
  "discount_value" numeric(10, 2) NOT NULL,
  "min_order_amount" numeric(10, 2),
  "max_discount" numeric(10, 2),
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "usage_limit" integer,
  "used_count" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

### Orders Table Updates

The orders table has been extended with coupon support:

```sql
ALTER TABLE "orders" ADD COLUMN "discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL;
ALTER TABLE "orders" ADD COLUMN "coupon_id" uuid REFERENCES "coupons"("id");
ALTER TABLE "orders" ADD COLUMN "coupon_code" text;
```

## Server Actions

### Core Functions

#### `createCoupon(data: CreateCouponData)`
Creates a new coupon with validation.

```typescript
const result = await createCoupon({
  code: "SUMMER2024",
  discountType: "percentage",
  discountValue: 15,
  minOrderAmount: 50,
  maxDiscount: 25,
  startDate: new Date("2024-06-01"),
  endDate: new Date("2024-08-31"),
  usageLimit: 100,
  description: "Summer sale discount"
});
```

#### `updateCoupon(data: UpdateCouponData)`
Updates an existing coupon.

```typescript
const result = await updateCoupon({
  id: "coupon-id",
  discountValue: 20,
  usageLimit: 150
});
```

#### `deleteCoupon(id: string)`
Soft deletes a coupon by setting `isActive` to false.

```typescript
const result = await deleteCoupon("coupon-id");
```

#### `validateCoupon(data: ValidateCouponData)`
Validates a coupon for use during checkout.

```typescript
const result = await validateCoupon({
  code: "SUMMER2024",
  cartTotal: 75.50
});

// Returns:
{
  isValid: true,
  discountAmount: 11.33,
  finalPrice: 64.17,
  coupon: {
    id: "coupon-id",
    code: "SUMMER2024",
    discountType: "percentage",
    discountValue: 15,
    maxDiscount: 25
  }
}
```

#### `applyCoupon(data: ApplyCouponData)`
Applies a coupon to an order with transaction safety.

```typescript
const result = await applyCoupon({
  orderId: "order-id",
  couponCode: "SUMMER2024"
});
```

#### `getCoupons(filters?)`
Retrieves coupons with optional filtering.

```typescript
// Get all active coupons
const result = await getCoupons({ isActive: true });

// Get expired coupons
const result = await getCoupons({ isExpired: true });

// Search coupons
const result = await getCoupons({ search: "SUMMER" });
```

## Components

### Admin Components

#### `CouponForm`
Complete form for creating and editing coupons.

```tsx
<CouponForm
  coupon={existingCoupon} // Optional, for editing
  onSuccess={() => console.log("Coupon saved!")}
  onCancel={() => console.log("Cancelled")}
/>
```

#### `CouponsTable`
Data table with filtering, sorting, and actions.

```tsx
<CouponsTable
  coupons={couponsList}
  onEdit={(coupon) => handleEdit(coupon)}
  onRefresh={() => fetchCoupons()}
/>
```

### Checkout Components

#### `CouponValidator`
Component for coupon validation during checkout.

```tsx
<CouponValidator
  cartTotal={75.50}
  onCouponApplied={(result) => handleCouponApplied(result)}
  onCouponRemoved={() => handleCouponRemoved()}
  appliedCoupon={currentCoupon}
/>
```

## Utility Functions

### `formatCurrency(amount: number | string)`
Formats numbers as USD currency.

### `formatDiscount(coupon: Coupon)`
Formats discount value based on type (percentage or fixed).

### `calculateDiscount(coupon: Coupon, cartTotal: number)`
Calculates the actual discount amount for a given cart total.

### `isCouponActive(coupon: Coupon)`
Checks if a coupon is currently active.

### `getCouponStatus(coupon: Coupon)`
Returns the current status of a coupon.

### `generateCouponCode(prefix?: string)`
Generates a random coupon code.

## Validation Rules

### Coupon Code
- Must be unique
- 1-50 characters
- Alphanumeric and hyphens allowed

### Discount Values
- Must be positive
- Percentage discounts: 0-100%
- Fixed amounts: Any positive value

### Date Validation
- End date must be after start date
- Start date cannot be in the past (for new coupons)

### Usage Limits
- Must be positive integer
- Used count cannot exceed limit

### Minimum Order Amount
- Must be positive
- Cart total must meet minimum for coupon to be valid

## Security Features

### Race Condition Prevention
- Database transactions for coupon application
- Atomic increment of usage count
- Prevents over-usage of coupons

### Input Validation
- Zod schema validation for all inputs
- SQL injection prevention with parameterized queries
- XSS prevention with proper escaping

### Access Control
- Server-side validation only
- No client-side coupon logic
- Proper error handling and logging

## Usage Examples

### Creating a Summer Sale Coupon

```typescript
const summerCoupon = await createCoupon({
  code: "SUMMER2024",
  discountType: "percentage",
  discountValue: 15,
  minOrderAmount: 50,
  maxDiscount: 25,
  startDate: new Date("2024-06-01"),
  endDate: new Date("2024-08-31"),
  usageLimit: 100,
  description: "15% off orders over $50, max $25 discount"
});
```

### Validating During Checkout

```typescript
const validation = await validateCoupon({
  code: "SUMMER2024",
  cartTotal: 75.50
});

if (validation.isValid) {
  // Apply discount
  const finalPrice = validation.finalPrice;
  const savings = validation.discountAmount;
} else {
  // Show error message
  console.error(validation.error);
}
```

### Applying to Order

```typescript
const result = await applyCoupon({
  orderId: "order-123",
  couponCode: "SUMMER2024"
});

if (result.success) {
  // Order updated with discount
  const { order, coupon, discountAmount, finalPrice } = result.data;
}
```

## Error Handling

All server actions return consistent error responses:

```typescript
// Success response
{ success: true, data: result }

// Error response
{ success: false, error: "Error message" }
```

Common error scenarios:
- Coupon code already exists
- Invalid date ranges
- Usage limit exceeded
- Coupon expired or not yet active
- Minimum order amount not met
- Database connection issues

## Performance Considerations

### Indexing
- Unique index on coupon code
- Indexes on active status, dates, and creation time
- Foreign key indexes for order relationships

### Caching
- Consider Redis caching for frequently accessed coupons
- Cache validation results for active coupons

### Query Optimization
- Use specific field selection instead of `SELECT *`
- Implement pagination for large coupon lists
- Use database transactions for multi-step operations

## Testing

### Unit Tests
- Test all validation functions
- Test discount calculations
- Test date range validations

### Integration Tests
- Test server actions with database
- Test coupon application flow
- Test error scenarios

### E2E Tests
- Test admin dashboard workflow
- Test checkout coupon application
- Test edge cases and error handling

## Deployment

### Database Migration
```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:migrate
```

### Environment Variables
No additional environment variables required beyond existing database configuration.

### Monitoring
- Monitor coupon usage patterns
- Track validation failures
- Alert on unusual coupon activity

## Future Enhancements

### Planned Features
- [ ] Bulk coupon creation
- [ ] Coupon templates
- [ ] Advanced analytics
- [ ] Email integration for coupon codes
- [ ] A/B testing for coupon effectiveness
- [ ] Customer-specific coupons
- [ ] Coupon stacking rules
- [ ] Geographic restrictions

### Performance Improvements
- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] Background job processing
- [ ] CDN for static assets

## Support

For issues or questions about the coupon system:
1. Check the error logs
2. Verify database connectivity
3. Test with simple coupon creation
4. Review validation rules
5. Check date/timezone settings 