import { getCartData } from "@/modules/cart/actions/query";

import { CartPageContent } from "./cart-page-content";

export default async function CartPage() {
  const cartData = await getCartData();

  return <CartPageContent initialCartData={cartData} />;
}
