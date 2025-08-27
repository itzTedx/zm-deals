import { pluralize } from "@/lib/functions/pluralize";
import { getCart, getCartTotal } from "@/modules/cart/actions/query";
import { CartItemCard, CartSummary } from "@/modules/cart/components";

export default async function CartPage() {
  const cart = await getCart();
  const cartTotal = await getCartTotal();

  return (
    <main className="container grid max-w-7xl grid-cols-3 gap-6 py-8">
      <div className="col-span-2">
        <h1 className="font-semibold text-xl">
          Cart{" "}
          <span className="font-medium text-muted-foreground text-sm">
            ({cart.length} {pluralize("item", cart.length)})
          </span>
        </h1>

        <div className="mt-3 w-full space-y-2">
          {cart.map((item) => (
            <CartItemCard item={item} key={item.product.id} />
          ))}
        </div>
      </div>

      <CartSummary cartLength={cart.length} cartTotal={cartTotal} />
    </main>
  );
}
