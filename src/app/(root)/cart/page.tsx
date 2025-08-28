import { pluralize } from "@/lib/functions/pluralize";
import { getCartData } from "@/modules/cart/actions/query";
import { CartItem, CartSummary } from "@/modules/cart/components";
import { ProductCard } from "@/modules/product/components";
import { RecommendedProducts } from "@/modules/product/components/recommended-products";
import { getWishlistData } from "@/modules/wishlist/actions/query";

export default async function CartPage() {
  const cartData = await getCartData();
  const wishlist = await getWishlistData();

  const { items: cartItems, itemCount } = cartData;

  // Get cart product IDs for recommendations
  const cartProductIds = cartItems.map((item) => item.product.id);

  return (
    <main className="container">
      <section className="grid grid-cols-3 gap-6 pt-6 pb-12" id="cart">
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

          <div className="mt-6">
            <h3 className="font-semibold text-lg">From your Wishlist</h3>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {wishlist.items.map((item) => (
                <ProductCard data={item.product} key={item.product.id} showSeconds={false} />
              ))}
            </div>
          </div>
        </div>

        <CartSummary cartItems={cartItems} cartLength={cartItems.length} />
      </section>

      <RecommendedProducts
        cartProductIds={cartProductIds}
        limit={8}
        strategy="personalized"
        title="Products you might like"
      />
      <RecommendedProducts
        cartProductIds={cartProductIds}
        limit={8}
        strategy="category"
        title="Products related to this"
      />
      <RecommendedProducts cartProductIds={cartProductIds} limit={8} strategy="trending" title="Trending Products" />
      <RecommendedProducts cartProductIds={cartProductIds} limit={8} strategy="hybrid" title="Customers also Viewed" />
    </main>
  );
}
