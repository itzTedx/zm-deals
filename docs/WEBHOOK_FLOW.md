# Stripe Webhook Flow Documentation

## Overview

This document explains how Stripe webhooks are handled in the ZM Deals application and the expected flow for different payment scenarios.

## Webhook Events Handled

### Primary Events (Order Processing)

1. **`checkout.session.completed`** - **MAIN EVENT**
   - Creates the order in the database
   - Confirms the order and reserves inventory
   - Clears the user's cart
   - This is the primary event that triggers order creation

2. **`payment_intent.payment_failed`** - **FAILURE HANDLING**
   - Updates order status to failed
   - Cancels the order and releases inventory
   - Handles payment failures gracefully

3. **`payment_intent.canceled`** - **CANCELLATION HANDLING**
   - Updates order status to cancelled
   - Cancels the order and releases inventory
   - Handles user-initiated cancellations

### Informational Events (No Action Required)

4. **`payment_intent.succeeded`** - **SKIPPED**
   - This event is intentionally skipped
   - Order processing is handled by `checkout.session.completed`
   - Prevents duplicate order processing

5. **`charge.succeeded`** - **INFORMATIONAL**
   - No action required
   - Logged for monitoring purposes

6. **`charge.updated`** - **INFORMATIONAL**
   - No action required
   - Logged for monitoring purposes

7. **`mandate.updated`** - **INFORMATIONAL**
   - No action required
   - Logged for monitoring purposes

## Expected Webhook Sequence

For a successful checkout, you should see this sequence:

```
1. payment_intent.created (not handled)
2. payment_intent.succeeded (skipped - handled by checkout.session.completed)
3. charge.succeeded (informational)
4. checkout.session.completed (MAIN - creates order)
5. charge.updated (informational)
6. mandate.updated (informational)
```

## Duplicate Prevention

The system includes several mechanisms to prevent duplicate processing:

1. **Session ID Tracking**: Each checkout session is tracked by its unique ID
2. **Order Existence Check**: The `createOrder` function checks if an order already exists
3. **Payment Intent ID**: Orders are linked to payment intent IDs to prevent duplicates
4. **Event Skipping**: `payment_intent.succeeded` events are skipped to prevent conflicts

## Error Handling

- **Webhook Failures**: All webhook handlers include try-catch blocks
- **Database Errors**: Failed operations are logged with detailed error information
- **Inventory Management**: Failed orders automatically release reserved inventory
- **Cart Management**: Cart clearing failures are logged but don't block order processing

## Monitoring

All webhook events are logged with:
- Event type and timestamp
- Session ID and payment intent ID
- Success/failure status
- Detailed error messages when applicable

## Troubleshooting

### Common Issues

1. **Duplicate Orders**: Check if `payment_intent.succeeded` events are being processed
2. **Missing Orders**: Verify `checkout.session.completed` events are being received
3. **Inventory Issues**: Check if failed orders are properly releasing inventory

### Log Analysis

Look for these log patterns:
- `[Webhook] Processing event: checkout.session.completed`
- `[Webhook] Skipping payment_intent.succeeded - handled by checkout.session.completed`
- `Order created successfully` or `Order already existed`

## Configuration

Webhook configuration is handled in `src/lib/auth/server.ts` within the Stripe plugin configuration. 