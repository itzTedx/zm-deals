import { defaultStatements } from "better-auth/plugins/admin/access";

export const PERMISSIONS = {
  ...defaultStatements,
  coupons: ["create", "update", "delete"],
  products: ["create", "update", "delete"],
} as const;
