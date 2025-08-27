import { CartCheckoutSchema } from "../../checkout/mutation";
import { CartItem } from "../types";

export function prepareCartForCheckout(
  cart: CartItem[],
  discountAmount = 0,
  finalTotal?: number,
  couponCode?: string
): CartCheckoutSchema {
  const items = cart.map((item) => ({
    productId: item.product.id.toString(),
    quantity: item.quantity,
    name: item.product.title,
    description: item.product.description || "",
    price: Number(item.product.price),
    image: item.product.image,
  }));

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  return {
    items,
    total,
    discountAmount,
    finalTotal: finalTotal || total,
    couponCode,
  };
}

export function validateCartForCheckout(cart: CartItem[]): { isValid: boolean; error?: string } {
  if (cart.length === 0) {
    return { isValid: false, error: "Cart is empty" };
  }

  for (const item of cart) {
    if (item.quantity <= 0) {
      return { isValid: false, error: "Invalid quantity for item" };
    }

    if (!item.product.price || Number(item.product.price) <= 0) {
      return { isValid: false, error: "Invalid price for item" };
    }
  }

  return { isValid: true };
}
