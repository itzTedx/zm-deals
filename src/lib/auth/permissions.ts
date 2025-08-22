import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAccessControl } from "better-auth/plugins/access";
import { adminAc } from "better-auth/plugins/admin/access";

import { PERMISSIONS } from "./constants";
import { auth } from "./server";
import { HasPermissionOptions, PermissionMap } from "./types";

export const ac = createAccessControl(PERMISSIONS);

export const admin = ac.newRole({
  coupons: ["create", "update", "delete"],
  products: ["create", "update", "delete"],
  ...adminAc.statements,
});

export const user = ac.newRole({
  coupons: [],
  products: [],
});

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  return session;
}

export async function hasPermission(
  permissions: PermissionMap,
  { redirectTo = "/", throwOnFail = false }: HasPermissionOptions
) {
  const session = await requireUser();

  const res = await auth.api.userHasPermission({
    body: {
      role: session?.user.role,
      permissions,
    },
  });

  if (!res.success) {
    if (throwOnFail) {
      throw new Error("Unauthorized");
    }

    redirect(redirectTo);
  }

  return { session, res };
}

export async function isAdmin() {
  const session = await requireUser();
  if (session?.user.role !== "admin") {
    redirect("/");
  }

  return session;
}
