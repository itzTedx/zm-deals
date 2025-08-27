# Cart Module with Coupon Validation

This module provides cart functionality with integrated coupon validation for the ZM Deals e-commerce platform.

## Features

- ✅ **Cart Management**: Add, remove, and update cart items
- ✅ **Coupon Validation**: Real-time coupon validation during checkout
- ✅ **Discount Calculation**: Automatic discount calculation and display
- ✅ **Responsive Design**: Mobile-first design with Tailwind CSS
- ✅ **Type Safety**: Full TypeScript support with proper interfaces

## Components

### CartSummary
A client component that handles the cart summary with integrated coupon validation.

```tsx
import { CartSummary } from "@/modules/cart/components";

<CartSummary
  cartLength={cart.length}
  cartTotal={cartTotal}
  onCheckout={() => {
    // Handle checkout logic
  }}
/>
```

### CouponSection
A client component for coupon validation and application.

```tsx
import { CouponSection } from "@/modules/cart/components";

<CouponSection
  cartTotal={75.50}
  onCouponApplied={(result) => {
    // Handle successful coupon application
  }}
  onCouponRemoved={() => {
    // Handle coupon removal
  }}
  appliedCoupon={currentCoupon}
/>
```

## Usage Examples

### Basic Cart Page Integration

```tsx
import { getCart, getCartTotal } from "@/modules/cart/actions/query";
import { CartItemCard, CartSummary } from "@/modules/cart/components";

export default async function CartPage() {
  const cart = await getCart();
  const cartTotal = await getCartTotal();

  return (
    <main className="container grid max-w-7xl grid-cols-3 gap-6 py-8">
      <div className="col-span-2">
        <h1 className="font-semibold text-xl">Cart</h1>
        <div className="mt-3 w-full space-y-2">
          {cart.map((item) => (
            <CartItemCard item={item} key={item.product.id} />
          ))}
        </div>
      </div>
      
      <CartSummary
        cartLength={cart.length}
        cartTotal={cartTotal}
        onCheckout={() => {
          // Handle checkout logic
        }}
      />
    </main>
  );
}
```

### Testing Coupon Validation

To test the coupon validation functionality, you can use the provided test coupons:

1. **WELCOME10**: 10% off orders over $25 (max $20 discount)
2. **SAVE5**: $5 off orders over $50
3. **SUMMER20**: 20% off orders over $100 (max $50 discount)
4. **FREESHIP**: $10 off orders over $75

### Running the Seed Script

To add test coupons to your database:

```bash
# Run the seed script
npx tsx scripts/seed-coupons.ts
```

## Coupon Validation Features

### Real-time Validation
- Instant validation as users type coupon codes
- Clear error messages for invalid coupons
- Success feedback for valid coupons

### Validation Rules
- **Code Existence**: Coupon code must exist in database
- **Active Status**: Coupon must be active
- **Date Range**: Coupon must be within valid date range
- **Usage Limits**: Coupon usage must not exceed limits
- **Minimum Order**: Cart total must meet minimum requirements

### Discount Types
- **Percentage**: Percentage-based discounts (e.g., 10% off)
- **Fixed Amount**: Fixed dollar amount discounts (e.g., $5 off)

### Error Handling
- Invalid coupon codes
- Expired coupons
- Usage limit exceeded
- Minimum order amount not met
- Network errors

## State Management

The components use React hooks for state management:

- `useState` for local component state
- `useForm` for form handling with validation
- Server actions for data mutations
- Automatic revalidation

## Styling

All components are styled with:
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: High-quality React components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliant

## TypeScript Support

Full TypeScript support with proper interfaces:

```typescript
interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    maxDiscount?: number;
  };
}
```

## Integration with Coupon System

The cart module integrates seamlessly with the existing coupon system:

- Uses `validateCoupon` server action for validation
- Leverages existing coupon database schema
- Follows established patterns and conventions
- Maintains consistency with admin coupon management

## Performance Considerations

- **Server Components**: Cart page uses server components for initial data fetching
- **Client Components**: Interactive elements (coupon validation) use client components
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Error Boundaries**: Proper error handling and fallbacks

## Future Enhancements

- [ ] Cart persistence across sessions
- [ ] Bulk coupon operations
- [ ] Advanced discount rules
- [ ] Coupon stacking
- [ ] Analytics integration
- [ ] A/B testing support 