"use server";

import { headers } from "next/headers";

import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { users } from "@/server/schema/auth-generated";

export interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: "user" | "admin" | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  isAnonymous: boolean | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAllUsers(): Promise<{ success: boolean; users?: UserData[]; error?: string }> {
  const log = createLog("Users");

  log.info("Starting to fetch all users");

  try {
    // Get session and verify admin access
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      log.warn("Unauthorized access attempt to fetch users");
      return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "admin") {
      log.warn("Non-admin user attempted to fetch users", session.user.id);
      return { success: false, error: "Unauthorized" };
    }

    log.auth("User fetch authorized", session.user.id);

    // Fetch all users from the database
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    log.info(`Successfully fetched ${allUsers.length} users`);

    return { success: true, users: allUsers };
  } catch (error) {
    log.error("Failed to fetch users", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function getCurrentUser(): Promise<{ success: boolean; user?: UserData; error?: string }> {
  const log = createLog("Current User");

  log.info("Starting to fetch current user");

  try {
    // Get session and verify authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      log.warn("Unauthorized access attempt to fetch current user");
      return { success: false, error: "Not authenticated" };
    }

    log.auth("Current user fetch authorized", session.user.id);

    // Fetch current user from the database
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!currentUser) {
      log.warn("Current user not found in database", session.user.id);
      return { success: false, error: "User not found" };
    }

    log.info("Successfully fetched current user");

    return { success: true, user: currentUser };
  } catch (error) {
    log.error("Failed to fetch current user", error);
    return { success: false, error: "Failed to fetch current user" };
  }
}
