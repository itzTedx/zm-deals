import { pluralize } from "@/lib/functions/pluralize";
import { getCartData } from "@/modules/cart/actions/query";
import { CartItem, CartSummary } from "@/modules/cart/components";

export default async function CartPage() {
  const cartData = await getCartData();

  const { items: cartItems, itemCount } = cartData;

  // Calculate total dynamically to ensure it's always up to date
  // const cartTotal = cartItems.reduce((total, item) => {
  //   const price = Number(item.product.price);
  //   return total + price * item.quantity;
  // }, 0);

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
            <CartItem item={item} key={item.product.id} />
          ))}
        </div>
      </div>

      <CartSummary cartItems={cartItems} cartLength={cartItems.length} />
    </main>
  );
}
