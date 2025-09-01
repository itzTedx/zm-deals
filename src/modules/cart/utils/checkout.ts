import { validateStockAvailability } from "@/modules/inventory/actions/mutation";

import type { CartCheckoutSchema } from "../../checkout/mutation";
import type { CartItem } from "../types";

export function prepareCartForCheckout(
  cart: CartItem[],
  discountAmount = 0,
  finalTotal?: number,
  couponCode?: string,
  sessionId?: string
): CartCheckoutSchema {
  const items = cart.map((item) => {
    if (item.itemType === "product" && item.product) {
      return {
        productId: item.product.id,
        quantity: item.quantity,
        name: item.product.title,
        description: item.product.overview || undefined,
        price: Number(item.product.price),
        image: item.product.image || undefined,
      };
    }
    if (item.itemType === "combo" && item.comboDeal) {
      return {
        productId: item.comboDeal.id, // Use combo deal ID
        quantity: item.quantity,
        name: item.comboDeal.title,
        description: item.comboDeal.description || undefined,
        price: Number(item.comboDeal.comboPrice),
        image: item.comboDeal.images?.[0]?.url || undefined,
      };
    }
    // This should never happen, but TypeScript needs it
    throw new Error("Invalid cart item type");
  });

  const total = cart.reduce((sum, item) => {
    if (item.itemType === "product" && item.product) {
      const price = Number(item.product.price);
      return sum + price * item.quantity;
    }
    if (item.itemType === "combo" && item.comboDeal) {
      const price = Number(item.comboDeal.comboPrice);
      return sum + price * item.quantity;
    }
    return sum;
  }, 0);

  // Calculate shipping fee
  const shippingFee = cart.some((item) => item.itemType === "product" && item.product?.isDeliveryFree)
    ? 0
    : cart.reduce((sum, item) => {
        if (item.itemType === "product" && item.product) {
          return sum + Number(item.product.deliveryFee);
        }
        // Combo deals don't have individual delivery fees
        return sum + 0;
      }, 0);

  return {
    items,
    total,
    discountAmount,
    finalTotal: finalTotal || total + shippingFee,
    couponCode,
    sessionId,
    shippingFee, // Add shipping fee to checkout data
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

    if (item.itemType === "product" && item.product) {
      if (!item.product.price || Number(item.product.price) <= 0) {
        return { isValid: false, error: "Invalid price for item" };
      }
    } else if (item.itemType === "combo" && item.comboDeal) {
      if (!item.comboDeal.comboPrice || Number(item.comboDeal.comboPrice) <= 0) {
        return { isValid: false, error: "Invalid price for combo deal" };
      }
    }
  }

  // Inventory validation - only for products, not combo deals
  const productItems = cart.filter((item) => item.itemType === "product" && item.product);

  if (productItems.length > 0) {
    const stockValidation = await validateStockAvailability(
      productItems.map((item) => ({
        productId: item.product!.id,
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
  }

  return { isValid: true };
}
