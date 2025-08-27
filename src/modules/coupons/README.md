# Coupons Module

A complete coupon management system for ZM Deals e-commerce platform, organized as a proper module following the established project structure.

## 📁 Module Structure

```
src/modules/coupons/
├── index.ts                    # Main exports
├── types.ts                    # TypeScript types and schemas
├── schema.ts                   # Database schema reference
├── utils.ts                    # Utility functions
├── README.md                   # This file
├── actions/
│   ├── mutation.ts             # Server actions for mutations (create, update, delete)
│   └── query.ts                # Server actions for queries (read, validate)
└── components/
    ├── coupon-form.tsx         # Form for creating/editing coupons
    ├── coupons-table.tsx       # Data table for managing coupons
    ├── coupon-validator.tsx    # Component for validating coupons during checkout
    ├── coupon-management.tsx   # Main management component
    └── checkout-integration.tsx # Example checkout integration
```

## 🚀 Quick Start

### Import the Module

```typescript
import { 
  CouponManagement, 
  CouponValidator, 
  createCoupon, 
  validateCoupon,
  formatCurrency 
} from "@/modules/coupons";
```

### Use in Admin Dashboard

```tsx
import { CouponManagement } from "@/modules/coupons";

export default function CouponsPage() {
  return (
    <div>
      <h1>Coupons</h1>
      <CouponManagement />
    </div>
  );
}
```

### Use in Checkout

```tsx
import { CouponValidator } from "@/modules/coupons";

export default function CheckoutPage() {
  return (
    <div>
      <CouponValidator
        cartTotal={75.50}
        onCouponApplied={(result) => console.log(result)}
        onCouponRemoved={() => console.log("Removed")}
      />
    </div>
  );
}
```

## 📦 Exports

### Components

- **`CouponManagement`** - Complete admin interface for managing coupons
- **`CouponForm`** - Form for creating and editing coupons
- **`CouponsTable`** - Data table with filtering and actions
- **`CouponValidator`** - Component for validating coupons during checkout
- **`CheckoutIntegration`** - Example checkout integration component

### Actions

#### Mutations (`actions/mutation.ts`)
- **`createCoupon(data)`** - Create a new coupon
- **`updateCoupon(data)`** - Update an existing coupon
- **`deleteCoupon(id)`** - Soft delete a coupon
- **`applyCoupon(data)`** - Apply a coupon to an order

#### Queries (`actions/query.ts`)
- **`getCoupons(filters?)`** - Get all coupons with optional filtering
- **`getCouponById(id)`** - Get a single coupon by ID
- **`validateCoupon(data)`** - Validate a coupon for use
- **`getActiveCoupons()`** - Get all currently active coupons

### Utilities (`utils.ts`)
- **`formatCurrency(amount)`** - Format numbers as USD currency
- **`formatDiscount(coupon)`** - Format discount value based on type
- **`calculateDiscount(coupon, cartTotal)`** - Calculate discount amount
- **`isCouponActive(coupon)`** - Check if coupon is currently active
- **`getCouponStatus(coupon)`** - Get the current status of a coupon
- **`generateCouponCode(prefix?)`** - Generate a random coupon code

### Types (`types.ts`)
- **`CreateCouponData`** - Data structure for creating coupons
- **`UpdateCouponData`** - Data structure for updating coupons
- **`ValidateCouponData`** - Data structure for validating coupons
- **`CouponValidationResult`** - Result of coupon validation
- **`CouponFilters`** - Filter options for querying coupons

## 🎯 Usage Examples

### Creating a Coupon

```typescript
import { createCoupon } from "@/modules/coupons";

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

### Validating a Coupon

```typescript
import { validateCoupon } from "@/modules/coupons";

const validation = await validateCoupon({
  code: "SUMMER2024",
  cartTotal: 75.50
});

if (validation.isValid) {
  console.log(`Discount: $${validation.discountAmount}`);
  console.log(`Final Price: $${validation.finalPrice}`);
}
```

### Applying a Coupon to Order

```typescript
import { applyCoupon } from "@/modules/coupons";

const result = await applyCoupon({
  orderId: "order-123",
  couponCode: "SUMMER2024"
});
```

### Using Utility Functions

```typescript
import { formatCurrency, generateCouponCode, getCouponStatus } from "@/modules/coupons";

const price = formatCurrency(25.99); // "$25.99"
const code = generateCouponCode("SUMMER"); // "SUMMERABC123"
const status = getCouponStatus(coupon); // "active" | "expired" | etc.
```

## 🔧 Database Schema

The module uses the following database schema (defined in `@/server/schema/coupons-schema.ts`):

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

## 🛡️ Security Features

- **Input Validation**: All inputs validated with Zod schemas
- **Race Condition Prevention**: Database transactions for coupon application
- **Usage Limit Enforcement**: Atomic increments prevent over-usage
- **Soft Deletes**: Safe deletion with deactivation
- **Server-Side Only**: No client-side coupon logic

## 🎨 UI Components

### CouponManagement
Complete admin interface with:
- Data table with filtering and search
- Create/edit form in modal
- Delete confirmation
- Real-time updates

### CouponValidator
Checkout component with:
- Real-time validation
- Error handling
- Success feedback
- Remove functionality

## 📱 Responsive Design

All components are built with:
- Mobile-first approach
- Tailwind CSS
- Shadcn UI components
- Accessible design patterns

## 🔄 State Management

The module uses React hooks for state management:
- `useState` for local component state
- `useForm` for form handling
- Server actions for data mutations
- Automatic revalidation with `revalidatePath`

## 🧪 Testing

The module is designed to be easily testable:
- Pure utility functions
- Separated concerns
- Type-safe interfaces
- Mockable server actions

## 📈 Performance

- Optimized database queries with proper indexing
- Efficient filtering and search
- Lazy loading of components
- Minimal re-renders

## 🔗 Integration

The module integrates with:
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Shadcn UI + Tailwind CSS
- **Validation**: Zod schemas
- **Forms**: React Hook Form
- **State**: React hooks
- **Server**: Next.js server actions

## 🚀 Future Enhancements

- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] Email integration
- [ ] A/B testing
- [ ] Customer-specific coupons
- [ ] Geographic restrictions
- [ ] Coupon stacking rules 