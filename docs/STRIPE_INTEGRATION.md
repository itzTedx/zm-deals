# Stripe Payment Integration

This document outlines the Stripe payment integration implemented in the ZM Deals application.

## Overview

The application uses Stripe Checkout for processing payments. The integration supports both authenticated and anonymous users, with proper cart management and webhook handling.

## Features

- ✅ Cart-based checkout with multiple items
- ✅ Support for authenticated and anonymous users
- ✅ Stripe Checkout integration
- ✅ Webhook handling for payment events
- ✅ Order status tracking
- ✅ Success/cancellation page handling

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
2. **Session Creation**: A Stripe checkout session is created with cart data
3. **Redirect**: User is redirected to Stripe's hosted checkout page
4. **Payment Processing**: Stripe handles the payment securely
5. **Webhook Processing**: Payment events are processed via webhooks
6. **Order Completion**: Cart is cleared and order is created

### File Structure

```
src/
├── modules/
│   ├── cart/
│   │   ├── components/
│   │   │   └── cart-sheet.tsx          # Cart UI with checkout button
│   │   └── utils/
│   │       └── checkout.ts             # Cart checkout utilities
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
Creates a Stripe checkout session for authenticated users with cart data.

#### `createAnonymousCheckoutSession`
Creates a Stripe checkout session for anonymous users.

#### `prepareCartForCheckout`
Utility function that prepares cart data for Stripe checkout.

#### `validateCartForCheckout`
Validates cart data before creating checkout session.

## Usage

### Cart Checkout

The checkout process is initiated from the cart sheet:

```typescript
const handleCheckout = () => {
  const validation = validateCartForCheckout(cart);
  if (!validation.isValid) {
    toast.error(validation.error);
    return;
  }

  const checkoutData = prepareCartForCheckout(cart);
  const result = await createCartCheckoutSession(checkoutData);
  
  if (result.success && result.url) {
    window.location.href = result.url;
  }
};
```

### Test Payment

Visit `/test-payment` to test the Stripe integration with a test product.

## Webhook Handling

The webhook handler processes various Stripe events:

- **checkout.session.completed**: Creates orders and clears carts
- **payment_intent.succeeded**: Updates order status
- **payment_intent.payment_failed**: Handles failed payments

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using the webhook secret
2. **Input Validation**: All checkout data is validated before processing
3. **Error Handling**: Comprehensive error handling for all payment operations
4. **Session Management**: Proper session handling for authenticated users

## Testing

### Test Cards

Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Mode

The integration uses Stripe's test mode by default. For production:

1. Update environment variables with live keys
2. Configure production webhook endpoints
3. Test thoroughly with small amounts

## Error Handling

The integration includes comprehensive error handling:

- Invalid cart data
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

## Support

For issues with the Stripe integration:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure webhook endpoints are configured properly
4. Test with Stripe's test mode first 