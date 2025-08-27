import { validateStockAvailability } from "@/modules/inventory/actions/mutation";

import type { CartCheckoutSchema } from "../../checkout/mutation";
import type { CartItem } from "../types";

export function prepareCartForCheckout(
  cart: CartItem[],
  discountAmount = 0,
  finalTotal?: number,
  couponCode?: string
): CartCheckoutSchema {
  const items = cart.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    name: item.product.title,
    description: item.product.description || undefined,
    price: Number(item.product.price),
    image: item.product.image || undefined,
  }));

  const total = cart.reduce((sum, item) => {
    const price = Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  return {
    items,
    total,
    discountAmount,
    finalTotal: finalTotal || total,
    couponCode,
  };
}

export async function validateCartForCheckout(cart: CartItem[]): Promise<{
  isValid: boolean;
  error?: string;
  stockErrors?: Array<{ productId: string; productTitle: string; requested: number; available: number; error: string }>;
}> {
  if (cart.length === 0) {
    return { isValid: false, error: "Cart is empty" };
  }

  // Basic validation
  for (const item of cart) {
    if (item.quantity <= 0) {
      return { isValid: false, error: "Invalid quantity for item" };
    }

    if (!item.product.price || Number(item.product.price) <= 0) {
      return { isValid: false, error: "Invalid price for item" };
    }
  }

  // Inventory validation
  const stockValidation = await validateStockAvailability(
    cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }))
  );

  if (!stockValidation.isValid) {
    return {
      isValid: false,
      error: "Some items are out of stock or have insufficient quantity",
      stockErrors: stockValidation.errors,
    };
  }

  return { isValid: true };
}
