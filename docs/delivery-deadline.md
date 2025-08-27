# Delivery Deadline Feature

## Overview

The Delivery Deadline feature provides a real-time countdown timer that encourages customers to place orders before 2:00 PM to receive delivery the next day. This feature includes animated number transitions and visual urgency indicators.

## Features

- **Real-time Countdown**: Animated countdown timer showing hours, minutes, and seconds until the 2:00 PM deadline
- **Number Flow Animation**: Smooth animated transitions when numbers change using the `@number-flow/react` library
- **Urgency Indicators**: Visual cues that change color and add animations when the deadline is approaching
- **Progress Bar**: Visual progress indicator showing how much of the day has passed
- **Responsive Design**: Compact mode for mobile devices and cart sheets
- **Smart Logic**: Automatically adjusts to show tomorrow's deadline if the current day's deadline has passed

## Components

### DeliveryDeadline Component

The main component that displays the countdown timer and delivery information.

```tsx
import { DeliveryDeadline } from "@/modules/cart/components/delivery-deadline";

// Full version for desktop
<DeliveryDeadline />

// Compact version for mobile/cart sheets
<DeliveryDeadline compact />
```

### Utility Functions

Located in `src/lib/utils/delivery-deadline.ts`:

- `getTimeUntilDeadline()` - Returns time components until deadline
- `isDeadlinePassed()` - Checks if current deadline has passed
- `getDeliveryDate()` - Returns formatted delivery date
- `getNextDeadline()` - Returns next deadline information
- `isDeadlineUrgent(minutes)` - Checks if deadline is urgent
- `getUrgencyLevel()` - Returns urgency level (low/medium/high/critical)
- `getDeadlineProgress()` - Returns progress percentage (0-100)

## Usage Examples

### Basic Implementation

```tsx
// In cart page
import { DeliveryDeadline } from "@/modules/cart/components/delivery-deadline";

export default function CartPage() {
  return (
    <div>
      <h1>Cart</h1>
      <DeliveryDeadline />
      {/* Cart items */}
    </div>
  );
}
```

### Mobile Cart Sheet

```tsx
// In cart sheet component
import { DeliveryDeadline } from "@/modules/cart/components/delivery-deadline";

export function CartSheet() {
  return (
    <Sheet>
      <SheetContent>
        <DeliveryDeadline compact />
        {/* Cart items */}
      </SheetContent>
    </Sheet>
  );
}
```

## Visual States

### Normal State (More than 1 hour remaining)
- Blue background and border
- Timer icon in blue
- Standard countdown display

### Urgent State (Less than 1 hour remaining)
- Red background and border
- Pulsing animation
- Warning emoji (⚠️) prefix
- Timer icon in red

### Deadline Passed State
- Green background and border
- Truck icon
- Shows next deadline information

## Technical Details

### Dependencies

- `@number-flow/react` - For animated number transitions
- `@radix-ui/react-progress` - For progress bar component
- React hooks for state management and effects

### Performance Optimizations

- Memoized components using `React.memo`
- Optimized re-renders with `useMemo` and `useCallback`
- Efficient time calculations with utility functions
- Cleanup of intervals on component unmount

### Accessibility

- Proper ARIA labels and roles
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

## Customization

### Styling

The component uses Tailwind CSS classes and can be customized by modifying the className props or extending the component.

### Deadline Time

To change the deadline from 2:00 PM to a different time, modify the utility functions in `src/lib/utils/delivery-deadline.ts`:

```tsx
// Change from 14 (2pm) to desired hour
deadline.setHours(16, 0, 0, 0); // 4pm deadline
```

### Urgency Thresholds

Adjust urgency thresholds in the utility functions:

```tsx
export function isDeadlineUrgent(minutes: number = 60): boolean {
  // Change default from 60 to desired minutes
  return totalMinutes <= minutes;
}
```

## Integration Points

The delivery deadline component is currently integrated in:

1. **Cart Page** (`src/app/(root)/cart/page.tsx`)
2. **Cart Sheet** (`src/modules/cart/components/cart-sheet.tsx`)

## Future Enhancements

Potential improvements for the delivery deadline feature:

- Sound notifications for urgent deadlines
- Push notifications for mobile users
- Integration with order processing system
- Multiple deadline times for different regions
- Holiday and weekend adjustments
- Delivery time zone support 