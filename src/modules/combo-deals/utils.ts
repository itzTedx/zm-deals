import type { ComboDealWithProducts } from "./types";

export function calculateComboSavings(originalPrice: number, comboPrice: number): number {
  return originalPrice - comboPrice;
}

export function calculateSavingsPercentage(originalPrice: number, comboPrice: number): number {
  if (originalPrice === 0) return 0;
  return ((originalPrice - comboPrice) / originalPrice) * 100;
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numPrice);
}

export function isComboDealActive(comboDeal: ComboDealWithProducts): boolean {
  if (!comboDeal.isActive) return false;

  const now = new Date();

  if (comboDeal.startsAt && now < comboDeal.startsAt) return false;
  if (comboDeal.endsAt && now > comboDeal.endsAt) return false;

  return true;
}

export function getComboDealStatus(comboDeal: ComboDealWithProducts): {
  status: "active" | "inactive" | "upcoming" | "expired";
  message: string;
} {
  if (!comboDeal.isActive) {
    return { status: "inactive", message: "Inactive" };
  }

  const now = new Date();

  if (comboDeal.startsAt && now < comboDeal.startsAt) {
    return { status: "upcoming", message: "Upcoming" };
  }

  if (comboDeal.endsAt && now > comboDeal.endsAt) {
    return { status: "expired", message: "Expired" };
  }

  return { status: "active", message: "Active" };
}

export function generateComboDealSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
