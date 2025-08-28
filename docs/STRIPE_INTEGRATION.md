# Stripe Payment Integration

This document outlines the Stripe payment integration implemented in the ZM Deals application.

## Overview

The application uses Stripe Checkout for processing payments. The integration supports both authenticated and anonymous users, with proper cart management, webhook handling, and **discount/coupon support**.

## Features

- ✅ Cart-based checkout with multiple items
- ✅ Support for authenticated and anonymous users
- ✅ Stripe Checkout integration
- ✅ **Discount and coupon support**
- ✅ Webhook handling for payment events
- ✅ Order status tracking
- ✅ Success/cancellation page handling

## Discount Flow Implementation

### Frontend Discount Processing

1. **Coupon Validation**: Coupons are validated on the frontend using the `validateCoupon` function
2. **Discount Calculation**: Discount amounts are calculated based on coupon type (percentage or fixed)
3. **Cart Summary**: Discount information is displayed in the cart summary component
4. **Checkout Preparation**: Discount data is passed to the checkout process

### Stripe Discount Integration

The discount flow is properly integrated with Stripe through the following mechanism:

1. **Discount Line Items**: Instead of just charging the final amount, discount line items are added to the Stripe checkout session
2. **Negative Amounts**: Discounts are represented as negative line items in Stripe
3. **Metadata Storage**: Discount information is stored in Stripe session metadata
4. **Webhook Processing**: Discount data is extracted and stored in the order during webhook processing

### Implementation Details

#### Checkout Session Creation

```typescript
// Helper function creates line items with discount
function createLineItemsWithDiscount(
  items: CartCheckoutSchema["items"],
  discountAmount = 0,
  couponCode?: string
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Add product line items
  items.forEach((item) => {
    lineItems.push({
      price_data: {
        currency: "AED",
        product_data: {
          name: item.name,
          description: item.description || "",
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    });
  });

  // Add discount line item if there's a discount
  if (discountAmount > 0) {
    lineItems.push({
      price_data: {
        currency: "AED",
        product_data: {
          name: couponCode ? `Discount (${couponCode})` : "Discount",
          description: "Applied discount",
        },
        unit_amount: -Math.round(discountAmount * 100), // Negative amount for discount
      },
      quantity: 1,
    });
  }

  return lineItems;
}
```

#### Webhook Processing

The webhook handler properly processes discount information:

1. **Filters Discount Items**: Discount line items (negative amounts) are filtered out when creating order items
2. **Extracts Metadata**: Discount amount and coupon code are extracted from session metadata
3. **Stores in Order**: Discount information is stored in the order record

```typescript
// Extract discount information from metadata
const discountAmount = parseFloat(sessionWithItems.metadata?.discountAmount || "0");
const couponCode = sessionWithItems.metadata?.couponCode || undefined;

// Filter out discount line items and map Stripe line items to order items
const items = stripeItems
  .filter((item) => {
    // Filter out discount line items (negative amounts)
    const amount = item.amount_total || 0;
    return amount > 0;
  })
  .map((item, index) => {
    // Map product items...
  });
```

### Benefits of This Approach

1. **Transparency**: Customers can see the discount clearly in the Stripe checkout page
2. **Accuracy**: Stripe handles the final calculation, ensuring accuracy
3. **Audit Trail**: Discount information is preserved in Stripe's system
4. **Flexibility**: Supports both percentage and fixed amount discounts
5. **Validation**: Coupon validation happens before Stripe processing

## Setup

### Environment Variables

Ensure the following environment variables are set in your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=http://localhost:3000
```

### Stripe Dashboard Configuration

1. **Webhook Endpoint**: Set up a webhook endpoint in your Stripe dashboard pointing to:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```

2. **Webhook Events**: Configure the following events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. **Payment Methods**: Enable the following payment methods:
   - Credit/Debit Cards
   - UPI (for Indian customers)

## Implementation Details

### Checkout Flow

1. **Cart Preparation**: Cart items are validated and prepared for checkout
2. **Discount Application**: Coupons are validated and discounts are calculated
3. **Session Creation**: A Stripe checkout session is created with cart data and discount line items
4. **Redirect**: User is redirected to Stripe's hosted checkout page
5. **Payment Processing**: Stripe handles the payment securely
6. **Webhook Processing**: Payment events are processed via webhooks
7. **Order Completion**: Cart is cleared and order is created with discount information

### File Structure

```
src/
├── modules/
│   ├── cart/
│   │   ├── components/
│   │   │   ├── cart-sheet.tsx          # Cart UI with checkout button
│   │   │   └── cart-summary.tsx        # Cart summary with discount display
│   │   └── utils/
│   │       └── checkout.ts             # Cart checkout utilities
│   ├── coupons/
│   │   ├── components/
│   │   │   └── coupon.tsx              # Coupon input component
│   │   ├── actions/
│   │   │   ├── mutation.ts             # Coupon CRUD operations
│   │   │   └── query.ts                # Coupon validation
│   │   └── types.ts                    # Coupon type definitions
│   └── checkout/
│       └── mutation.ts                 # Stripe checkout functions
├── app/
│   ├── (root)/
│   │   ├── checkout/
│   │   │   └── page.tsx                # Checkout success/cancellation page
│   │   └── test-payment/
│   │       └── page.tsx                # Test payment page
│   └── api/
│       └── webhooks/
│           └── stripe/
│               └── route.ts            # Stripe webhook handler
└── lib/
    └── stripe/
        └── client.ts                   # Stripe client configuration
```

### Key Functions

#### `createCartCheckoutSession`
Creates a Stripe checkout session for authenticated users with cart data and discount support.

#### `createAnonymousCheckoutSession`
Creates a Stripe checkout session for anonymous users with discount support.

#### `createLineItemsWithDiscount`
Helper function that creates Stripe line items including discount line items.

#### `prepareCartForCheckout`
Utility function that prepares cart data for Stripe checkout with discount information.

#### `validateCartForCheckout`
Validates cart data before creating checkout session.

#### `validateCoupon`
Validates coupon codes and calculates discount amounts.

## Usage

### Cart Checkout with Discount

The checkout process with discount support:

```typescript
const handleCheckout = () => {
  const validation = validateCartForCheckout(cart);
  if (!validation.isValid) {
    toast.error(validation.error);
    return;
  }

  const checkoutData = prepareCartForCheckout(
    cart,
    discountAmount,
    finalTotal,
    couponCode
  );
  const result = await createCartCheckoutSession(checkoutData);
  
  if (result.success && result.url) {
    window.location.href = result.url;
  }
};
```

### Coupon Application

```typescript
const handleCouponApplied = (result: CouponValidationResult) => {
  if (result.isValid && result.coupon) {
    setAppliedCoupon(result.coupon);
    setDiscountAmount(result.discountAmount);
    setFinalTotal(result.finalPrice);
  }
};
```

### Test Payment

Visit `/test-payment` to test the Stripe integration with a test product.

## Webhook Handling

The webhook handler processes various Stripe events:

- **checkout.session.completed**: Creates orders and clears carts (includes discount processing)
- **payment_intent.succeeded**: Updates order status
- **payment_intent.payment_failed**: Handles failed payments

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using the webhook secret
2. **Input Validation**: All checkout data is validated before processing
3. **Coupon Validation**: Coupons are validated server-side before application
4. **Error Handling**: Comprehensive error handling for all payment operations
5. **Session Management**: Proper session handling for authenticated users

## Testing

### Test Cards

Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Coupons

Use these test coupon codes:

- **WELCOME10**: 10% off orders over $25 (max $20)
- **SAVE5**: $5 off orders over $50
- **SUMMER20**: 20% off orders over $100 (max $50)

### Test Mode

The integration uses Stripe's test mode by default. For production:

1. Update environment variables with live keys
2. Configure production webhook endpoints
3. Test thoroughly with small amounts

## Error Handling

The integration includes comprehensive error handling:

- Invalid cart data
- Invalid coupon codes
- Network errors
- Stripe API errors
- Webhook verification failures
- Payment failures

## Future Enhancements

- [ ] Order management system
- [ ] Email notifications
- [ ] Payment method preferences
- [ ] Subscription support
- [ ] Refund handling
- [ ] Analytics integration
- [ ] Advanced coupon rules (product-specific, user-specific)
- [ ] Coupon usage tracking and analytics

## Support

For issues with the Stripe integration:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure webhook endpoints are configured properly
4. Test with Stripe's test mode first
5. Check coupon validation logs
6. Verify discount calculations in Stripe dashboard 