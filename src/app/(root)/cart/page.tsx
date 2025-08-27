import { Input } from "@/components/ui/input";

import { pluralize } from "@/lib/functions/pluralize";
import { getCart, getCartTotal } from "@/modules/cart/actions/query";
import { CartItemCard } from "@/modules/cart/components/cart-items";

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
        <div className="w-full space-y-4">
          {cart.map((item) => (
            <CartItemCard item={item} key={item.product.id} />
          ))}
        </div>
      </div>
      <div className="rounded-md border p-4">
        <h3 className="font-semibold text-lg">Order Summary</h3>

        <div className="flex rounded-md shadow-xs">
          <Input
            className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
            id="coupon"
            placeholder="Coupon Code"
            type="text"
          />
          <button className="inline-flex cursor-pointer items-center justify-center rounded-e-md border border-input bg-blue-700 px-3 font-medium text-card text-sm outline-none transition-colors hover:bg-blue-600 focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50">
            Apply
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <h4>Subtotal</h4>
            <p>{cartTotal}</p>
          </div>
          <div className="flex justify-between">
            <h4>Shipping Fee</h4>
            <p className="font-medium text-green-600">Free</p>
          </div>
        </div>
      </div>
    </main>
  );
}
