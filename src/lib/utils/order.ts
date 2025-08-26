import { randomBytes } from "crypto";

/**
 * Generates a unique order number with format: ZM-YYYYMMDD-XXXXXX
 * Where XXXXXX is a random 6-character alphanumeric string
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomString = randomBytes(3).toString("hex").toUpperCase();
  return `ZM-${dateString}-${randomString}`;
}

/**
 * Validates order data before creation
 */
export function validateOrderData(data: {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  customerEmail: string;
}): { isValid: boolean; error?: string } {
  if (!data.items || data.items.length === 0) {
    return { isValid: false, error: "Order must contain at least one item" };
  }

  if (!data.customerEmail || !data.customerEmail.includes("@")) {
    return { isValid: false, error: "Valid customer email is required" };
  }

  if (data.total <= 0) {
    return { isValid: false, error: "Order total must be greater than zero" };
  }

  // Validate individual items
  for (const item of data.items) {
    if (!item.productId) {
      return { isValid: false, error: "All items must have a product ID" };
    }
    if (item.quantity <= 0) {
      return { isValid: false, error: "All items must have a quantity greater than zero" };
    }
    if (item.price < 0) {
      return { isValid: false, error: "All items must have a non-negative price" };
    }
  }

  return { isValid: true };
}

/**
 * Formats address data for database storage
 */
export function formatAddress(address: {
  name?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  phone?: string;
}): {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
} {
  const nameParts = address.name?.split(" ") || ["", ""];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    firstName,
    lastName,
    address1: address.address?.line1 || "",
    address2: address.address?.line2,
    city: address.address?.city || "",
    state: address.address?.state || "",
    postalCode: address.address?.postal_code || "",
    country: address.address?.country || "",
    phone: address.phone,
  };
}
