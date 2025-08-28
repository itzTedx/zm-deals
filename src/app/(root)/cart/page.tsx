import { SectionHeader } from "@/components/layout/section-header";

import { pluralize } from "@/lib/functions/pluralize";
import { getCartData } from "@/modules/cart/actions/query";
import { CartItem, CartSummary } from "@/modules/cart/components";
import { getProducts } from "@/modules/product/actions/query";
import { ProductCard } from "@/modules/product/components/product-card";

export default async function CartPage() {
  const cartData = await getCartData();

  const products = await getProducts();

  const { items: cartItems, itemCount } = cartData;

  // Create a Set of product IDs that are already in the cart
  const cartProductIds = new Set(cartItems.map((item) => item.product.id));

  // Filter out products that are already in the cart
  const relatedProducts = products.filter((product) => !cartProductIds.has(product.id));

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
      <section className="grid grid-cols-4 gap-6 pb-12" id="products">
        <SectionHeader
          className="col-span-full"
          description="You might also like these products"
          hasButton={false}
          title="Related Products"
          titleClassName="text-lg md:text-xl leading-none"
        />

        <div className="col-span-full grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {relatedProducts.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
