# Stripe Coupon Integration

This document outlines the comprehensive Stripe coupon integration implemented in the ZM Deals application, which provides seamless synchronization between your database coupons and Stripe's native coupon system.

## Overview

The integration provides a dual approach to coupon handling:

1. **Database-First Management**: All coupons are managed in your database with full control
2. **Stripe Synchronization**: Coupons are automatically synced to Stripe for native checkout support
3. **Fallback System**: If Stripe coupons fail, the system falls back to manual discount line items

## Features

### ✅ Core Features
- **Automatic Sync**: Database coupons are automatically synced to Stripe
- **Bidirectional Updates**: Changes in database are reflected in Stripe
- **Native Stripe Support**: Uses Stripe's built-in coupon system for better UX
- **Fallback Mechanism**: Manual discount line items if Stripe coupons fail
- **Admin Interface**: Complete management interface for sync status
- **Validation**: Comprehensive validation for both database and Stripe coupons

### ✅ Discount Types Supported
- **Percentage Discounts**: e.g., 15% off
- **Fixed Amount Discounts**: e.g., $10 off
- **Usage Limits**: Configurable maximum redemptions
- **Date Restrictions**: Start and end dates
- **Minimum Order Requirements**: Order amount validation
- **Maximum Discount Caps**: Limit maximum discount amount

## Architecture

### Database Schema

```sql
-- Coupons table with Stripe integration
CREATE TABLE coupons (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  stripe_coupon_id TEXT, -- NEW: Links to Stripe coupon
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### File Structure

```
src/modules/coupons/
├── actions/
│   ├── mutation.ts              # Main CRUD operations
│   ├── query.ts                 # Validation and queries
│   ├── stripe-integration.ts    # Stripe sync functions
│   └── sync-utility.ts          # Sync management utilities
├── components/
│   ├── coupon-form.tsx          # Coupon creation/editing
│   ├── coupon-list.tsx          # Coupon listing
│   └── stripe-sync-panel.tsx    # NEW: Sync management UI
└── types.ts                     # Type definitions
```

## Implementation Details

### 1. Stripe Integration Functions

#### `createStripeCoupon(data: CreateCouponData)`
Creates a coupon in both database and Stripe:

```typescript
// Creates database record first
const [dbCoupon] = await db.insert(coupons).values({...}).returning();

// Then creates Stripe coupon
const stripeCoupon = await stripeClient.coupons.create({
  id: dbCoupon.code, // Use coupon code as Stripe ID
  duration: "once",
  percent_off: data.discountType === "percentage" ? data.discountValue : undefined,
  amount_off: data.discountType === "fixed" ? data.discountValue * 100 : undefined,
  currency: "usd",
  max_redemptions: data.usageLimit,
  redeem_by: Math.floor(data.endDate.getTime() / 1000),
  metadata: {
    db_coupon_id: dbCoupon.id,
    created_at: new Date().toISOString(),
  },
});

// Updates database with Stripe ID
await db.update(coupons)
  .set({ stripeCouponId: stripeCoupon.id })
  .where(eq(coupons.id, dbCoupon.id));
```

#### `updateStripeCoupon(data: UpdateCouponData)`
Updates both database and Stripe:

```typescript
// Updates database first
const [updatedDbCoupon] = await db.update(coupons).set(updateData).returning();

// Then updates Stripe if it exists
if (existingCoupon.stripeCouponId) {
  await stripeClient.coupons.update(existingCoupon.stripeCouponId, {
    metadata: { updated_at: new Date().toISOString() },
    max_redemptions: data.usageLimit,
    redeem_by: data.endDate ? Math.floor(data.endDate.getTime() / 1000) : undefined,
  });
}
```

#### `deleteStripeCoupon(id: string)`
Soft deletes from database and removes from Stripe:

```typescript
// Soft delete in database
const [updatedDbCoupon] = await db.update(coupons)
  .set({ isActive: false })
  .where(eq(coupons.id, id))
  .returning();

// Delete from Stripe
if (existingCoupon.stripeCouponId) {
  await stripeClient.coupons.del(existingCoupon.stripeCouponId);
}
```

### 2. Checkout Integration

#### Enhanced Checkout Function
The checkout process now supports both Stripe native coupons and manual discounts:

```typescript
export async function createCartCheckoutSession(checkoutData: CartCheckoutSchema) {
  // If coupon code provided, try Stripe native first
  if (couponCode) {
    try {
      const result = await createCartCheckoutSessionWithStripeCoupon(checkoutData);
      if (result.success) {
        return result; // Use Stripe native coupon
      }
    } catch (error) {
      console.warn("Stripe coupon failed, falling back to manual discount");
    }
  }

  // Fallback to manual discount line items
  const lineItems = createLineItemsWithDiscount(items, discountAmount, couponCode);
  // ... rest of checkout logic
}
```

#### Stripe Native Coupon Checkout
```typescript
export async function createCartCheckoutSessionWithStripeCoupon(checkoutData: CartCheckoutSchema) {
  const stripeParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: lineItems, // No discount line items needed
    discounts: couponCode ? [{ coupon: couponCode }] : undefined, // Stripe handles discount
    metadata: {
      couponCode,
      discountMethod: "stripe_native",
    },
  };
}
```

### 3. Sync Management

#### Sync All Coupons
```typescript
export async function syncCouponsToStripe() {
  const dbCoupons = await db.query.coupons.findMany({
    where: eq(coupons.isActive, true),
  });

  for (const dbCoupon of dbCoupons) {
    if (!dbCoupon.stripeCouponId) {
      // Create Stripe coupon for unsynced coupons
      const stripeCoupon = await stripeClient.coupons.create({...});
      await db.update(coupons)
        .set({ stripeCouponId: stripeCoupon.id })
        .where(eq(coupons.id, dbCoupon.id));
    }
  }
}
```

#### Sync Status Monitoring
```typescript
export async function getCouponSyncStatus() {
  const dbCoupons = await db.query.coupons.findMany();
  const stripeCoupons = await stripeClient.coupons.list();

  return dbCoupons.map(dbCoupon => ({
    dbCoupon,
    hasStripeId: !!dbCoupon.stripeCouponId,
    stripeCoupon: stripeCoupons.data.find(sc => sc.id === dbCoupon.stripeCouponId),
    status: dbCoupon.stripeCouponId ? "synced" : "not_synced",
  }));
}
```

## Usage Examples

### Creating a Coupon
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

// This automatically creates both database and Stripe coupons
```

### Checkout with Coupon
```typescript
const checkoutResult = await createCartCheckoutSession({
  items: cartItems,
  total: 100,
  couponCode: "SUMMER2024",
  discountAmount: 15,
  finalTotal: 85,
});

// Uses Stripe native coupon if available, falls back to manual discount
```

### Sync Management
```typescript
// Sync all existing coupons to Stripe
const syncResult = await syncAllCouponsToStripe();

// Check sync status
const status = await getCouponSyncStatus();
console.log(`${status.synced}/${status.total} coupons synced`);
```

## Admin Interface

### Stripe Sync Panel
The admin interface includes a dedicated panel for managing Stripe synchronization:

- **Sync Status Overview**: Shows total, synced, and unsynced coupons
- **One-Click Sync**: Sync all unsynced coupons to Stripe
- **Detailed Status**: Individual coupon sync status
- **Real-time Updates**: Refresh sync status

### Integration Points
- **Coupon Management**: All CRUD operations now sync with Stripe
- **Validation**: Coupons are validated in both systems
- **Error Handling**: Graceful fallback if Stripe operations fail

## Benefits

### For Customers
1. **Better UX**: Native Stripe discount display
2. **Transparency**: Clear discount breakdown in checkout
3. **Reliability**: Stripe handles discount calculations
4. **Consistency**: Same experience across all payment methods

### For Merchants
1. **Centralized Management**: Manage coupons in one place
2. **Automatic Sync**: No manual Stripe coupon creation needed
3. **Fallback Safety**: System works even if Stripe is down
4. **Audit Trail**: Complete tracking of coupon usage
5. **Flexibility**: Support for complex discount rules

### For Developers
1. **Type Safety**: Full TypeScript support
2. **Error Handling**: Comprehensive error management
3. **Testing**: Easy to test both systems
4. **Monitoring**: Built-in sync status monitoring
5. **Extensibility**: Easy to add new discount types

## Configuration

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Dashboard Setup
1. **Coupons Section**: View and manage synced coupons
2. **Webhook Events**: Monitor coupon usage events
3. **Analytics**: Track coupon performance

## Testing

### Test Coupons
```typescript
// Test percentage discount
const testCoupon1 = await createCoupon({
  code: "TEST10",
  discountType: "percentage",
  discountValue: 10,
  usageLimit: 1000,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
});

// Test fixed amount discount
const testCoupon2 = await createCoupon({
  code: "SAVE5",
  discountType: "fixed",
  discountValue: 5,
  minOrderAmount: 25,
  usageLimit: 500,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});
```

### Test Checkout Flow
1. Create test coupons
2. Add items to cart
3. Apply coupon code
4. Proceed to checkout
5. Verify discount appears correctly
6. Complete payment
7. Check order history for discount details

## Troubleshooting

### Common Issues

#### Coupon Not Syncing to Stripe
- Check Stripe API key permissions
- Verify coupon code format (alphanumeric only)
- Check for duplicate coupon codes in Stripe

#### Checkout Fails with Stripe Coupon
- System automatically falls back to manual discount
- Check Stripe dashboard for coupon status
- Verify coupon hasn't expired or reached usage limit

#### Sync Status Not Updating
- Refresh sync status manually
- Check database connection
- Verify Stripe API connectivity

### Debug Information
```typescript
// Enable debug logging
console.log("Stripe coupon creation:", stripeCoupon);
console.log("Database update:", updatedCoupon);
console.log("Sync status:", syncStatus);
```

## Future Enhancements

### Planned Features
1. **Promotion Codes**: Support for Stripe promotion codes
2. **Bulk Operations**: Bulk coupon creation and sync
3. **Advanced Rules**: Product-specific discounts
4. **Analytics**: Coupon performance tracking
5. **Webhooks**: Real-time sync via Stripe webhooks

### Integration Opportunities
1. **Email Marketing**: Automatic coupon generation
2. **Loyalty System**: Points-based discounts
3. **Referral System**: Referral-specific coupons
4. **Seasonal Campaigns**: Automated seasonal discounts

## Conclusion

The Stripe coupon integration provides a robust, user-friendly solution for managing discounts in your e-commerce application. It combines the flexibility of database management with the reliability of Stripe's native coupon system, ensuring a seamless experience for both customers and merchants.

The dual-approach system (Stripe native + fallback) ensures that your checkout process remains functional even if there are issues with Stripe, while providing the best possible user experience when everything is working correctly. 