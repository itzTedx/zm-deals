import { pluralize } from "@/lib/functions/pluralize";
import { CartItemCard } from "@/modules/cart/components/cart-item-card";
import { CartSummary } from "@/modules/cart/components/cart-summary-new";
import { CartItem } from "@/modules/cart/types";

interface CartPageContentProps {
  initialCartData: {
    items: CartItem[];
    itemCount: number;
    total: number;
  };
}

export function CartPageContent({ initialCartData }: CartPageContentProps) {
  const { items: cartItems, itemCount, total: cartTotal } = initialCartData;

  return (
    <main className="container grid max-w-7xl grid-cols-3 gap-6 py-8">
      <div className="col-span-2">
        <h1 className="font-semibold text-xl">
          Cart{" "}
          <span className="font-medium text-muted-foreground text-sm">
            ({itemCount} {pluralize("item", itemCount)})
          </span>
        </h1>

        <div className="mt-3 w-full space-y-2">
          {cartItems.map((item) => (
            <CartItemCard item={item} key={item.product.id} />
          ))}
        </div>
      </div>

      <CartSummary cartItems={cartItems} cartLength={cartItems.length} cartTotal={cartTotal} />
    </main>
  );
}
