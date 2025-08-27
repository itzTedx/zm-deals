# Database-Driven Cart System

This document describes the new database-driven cart system that replaces the global state approach with server actions and database queries.

## Overview

The new cart system uses:
- **Server Actions** for all cart operations (add, remove, update, clear)
- **Database Queries** for fetching cart data
- **Server Components** where possible for better performance
- **Client Components** only when interactivity is needed

## Key Benefits

1. **No Global State**: Eliminates Jotai atoms and localStorage dependencies
2. **Real-time Data**: Always fetches fresh data from the database
3. **Better Performance**: Server-side rendering with minimal client-side JavaScript
4. **Consistent State**: Single source of truth in the database
5. **Better UX**: Immediate feedback with optimistic updates

## Architecture

### Server Actions (`actions/`)

#### Query Actions (`actions/query.ts`)
- `getCart()` - Get cart items for authenticated users
- `getCartItemCount()` - Get total item count
- `getCartTotal()` - Calculate cart total
- `getCartData()` - Get complete cart data (items, count, total)

#### Mutation Actions (`actions/mutation.ts`)
- `addToCart()` - Add item to cart
- `removeFromCart()` - Remove item from cart
- `updateCartItemQuantity()` - Update item quantity
- `clearCart()` - Clear entire cart
- `migrateAnonymousCart()` - Migrate anonymous cart to user account

### Components

#### Server Components
- `CartIconServer` - Server-side cart icon with real-time count
- `CartPageContent` - Main cart page content

#### Client Components
- `CartItemCard` - Individual cart item with remove functionality
- `CartSummary` - Cart summary with checkout and coupon functionality
- `CartSheet` - Cart slide-out panel
- `BuyButtonServer` - Add to cart button

#### Context Provider
- `CartProvider` - Manages cart state and provides refresh functionality

## Usage Examples

### Basic Cart Page

```tsx
// Server Component
export default async function CartPage() {
  const cartData = await getCartData();
  return <CartPageContent initialCartData={cartData} />;
}

// Client Component
function CartPageContent({ initialCartData }) {
  return (
    <CartProvider initialCartData={initialCartData}>
      <CartPageInner />
    </CartProvider>
  );
}
```

### Cart Icon in Header

```tsx
// Server Component
export async function Header() {
  return (
    <header>
      <CartIconServer />
    </header>
  );
}
```

### Add to Cart Button

```tsx
// Client Component
function ProductCard({ product }) {
  const { refreshCart } = useCartContext();
  
  return (
    <BuyButtonServer 
      data={product} 
      onCartUpdated={refreshCart}
    />
  );
}
```

### Cart Item Management

```tsx
// Client Component
function CartItemCard({ item }) {
  const { refreshCart } = useCartContext();
  
  return (
    <div>
      <h3>{item.product.title}</h3>
      <button onClick={() => removeFromCart(item.product.id)}>
        Remove
      </button>
    </div>
  );
}
```

## Migration from Global State

### Before (Global State)
```tsx
import { useAtom } from "jotai";
import { cartAtom, cartItemCountAtom } from "../atom";

function CartIcon() {
  const [itemCount] = useAtom(cartItemCountAtom);
  return <span>{itemCount}</span>;
}
```

### After (Database Queries)
```tsx
// Server Component
export async function CartIconServer() {
  const itemCount = await getCartItemCount();
  return <span>{itemCount}</span>;
}
```

## Authentication Handling

The system handles both authenticated and anonymous users:

- **Authenticated Users**: All cart data is stored in the database
- **Anonymous Users**: Cart operations create anonymous sessions when needed

## Error Handling

All server actions include proper error handling:

```tsx
const result = await addToCart(productId, quantity);
if (result.success) {
  toast.success("Added to cart!");
} else {
  toast.error(result.error || "Failed to add to cart");
}
```

## Performance Considerations

1. **Server-Side Rendering**: Cart data is fetched on the server
2. **Optimistic Updates**: UI updates immediately, then syncs with server
3. **Minimal Re-renders**: Only affected components re-render
4. **Efficient Queries**: Single query for complete cart data

## Testing

The new system is easier to test because:
- No global state dependencies
- Clear separation between server and client logic
- Predictable data flow
- Server actions can be tested independently

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live cart updates
2. **Cart Persistence**: Better anonymous cart handling
3. **Offline Support**: Service worker for offline cart management
4. **Analytics**: Better tracking of cart interactions 