import { defaultStatements } from "better-auth/plugins/admin/access";

export const PERMISSIONS = {
  ...defaultStatements,
  coupons: ["create", "update", "delete"],
  products: ["create", "update", "delete"],
} as const;

export const SESSION_ID_COOKIE = "zm_deals_guest";
export const SESSION_ID_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
