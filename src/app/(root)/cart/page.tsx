import { pluralize } from "@/lib/functions/pluralize";
import { getCartData } from "@/modules/cart/actions/query";
import { CartItem, CartSummary } from "@/modules/cart/components";
import type { CartItem as CartItemType } from "@/modules/cart/types";
import { ProductCard } from "@/modules/product/components";
import { RecommendedProducts } from "@/modules/product/components/recommended-products";
import { getWishlistData } from "@/modules/wishlist/actions/query";

export default async function CartPage() {
  const cartData = await getCartData();
  const wishlist = await getWishlistData();

  const { items: cartItems, itemCount } = cartData;

  // Filter out invalid items and transform to proper CartItem type
  const validCartItems: CartItemType[] = cartItems
    .filter((item) => (item.itemType === "product" && item.product) || (item.itemType === "combo" && item.comboDeal))
    .map((item) => {
      if (item.itemType === "product" && item.product) {
        return {
          id: item.id,
          product: item.product,
          comboDeal: undefined,
          quantity: item.quantity,
          itemType: "product" as const,
        };
      }
      if (item.itemType === "combo" && item.comboDeal) {
        // Create a simplified combo deal structure for now
        // This can be enhanced later when we implement combo deal display
        return {
          id: item.id,
          product: undefined,
          comboDeal: {
            id: item.comboDeal.id,
            title: item.comboDeal.title,
            description: item.comboDeal.description,
            slug: item.comboDeal.slug,
            isFeatured: item.comboDeal.isFeatured,
            isActive: item.comboDeal.isActive,
            originalPrice: item.comboDeal.originalPrice,
            comboPrice: item.comboDeal.comboPrice,
            savings: item.comboDeal.savings,
            startsAt: item.comboDeal.startsAt,
            endsAt: item.comboDeal.endsAt,
            maxQuantity: item.comboDeal.maxQuantity,
            createdAt: item.comboDeal.createdAt,
            updatedAt: item.comboDeal.updatedAt,
            products: item.comboDeal.products || [],
            images:
              item.comboDeal.images
                ?.map((img) => ({
                  id: img.id,
                  url: img.media?.url || "",
                  alt: undefined,
                  isFeatured: img.isFeatured || false,
                  sortOrder: img.sortOrder || 0,
                  key: img.media?.key || undefined,
                  width: undefined,
                  height: undefined,
                  blurData: undefined,
                }))
                .filter((img) => img.url) || [],
          },
          quantity: item.quantity,
          itemType: "combo" as const,
        };
      }
      // This should never happen due to the filter above, but TypeScript needs it
      throw new Error("Invalid cart item");
    });

  const cartProductIds = validCartItems
    .filter((item) => item.itemType === "product" && item.product)
    .map((item) => item.product!.id);

  return (
    <main className="container">
      <section className="grid grid-cols-1 gap-4 pt-4 pb-8 lg:grid-cols-3 lg:gap-6 lg:pt-6 lg:pb-12" id="cart">
        <div className="max-lg:order-2 lg:col-span-2">
          <div>
            <h1 className="font-semibold text-lg lg:text-xl">
              Cart{" "}
              <span className="font-medium text-muted-foreground text-sm">
                ({itemCount} {pluralize("item", itemCount)})
              </span>
            </h1>

            <div className="mt-3 w-full space-y-2">
              {validCartItems.map((item) => (
                <CartItem item={item} key={item.id} />
              ))}
            </div>
          </div>

          {wishlist.items.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-base lg:text-lg">From your Wishlist</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-2">
                {wishlist.items.map((item) => (
                  <ProductCard data={item.product} key={item.product.id} showSeconds={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="max-lg:order-1 lg:col-span-1">
          <CartSummary cartItems={validCartItems} cartLength={validCartItems.length} />
        </div>
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
