import { pluralize } from "@/lib/functions/pluralize";
import { getCartData } from "@/modules/cart/actions/query";
import { CartItem, CartSummary } from "@/modules/cart/components";
import { RecommendedProducts } from "@/modules/product/components/recommended-products";

export default async function CartPage() {
  const cartData = await getCartData();

  const { items: cartItems, itemCount } = cartData;

  // Get cart product IDs for recommendations
  const cartProductIds = cartItems.map((item) => item.product.id);

  return (
    <main className="container max-w-7xl">
      <section className="grid grid-cols-3 gap-6 py-12" id="cart">
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
      </section>

      <RecommendedProducts
        cartProductIds={cartProductIds}
        description="You might also like these products"
        limit={8}
        strategy="hybrid"
        title="Related Products"
      />
    </main>
  );
}
