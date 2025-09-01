"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { users } from "@/server/schema/auth-generated";

import { UpdateProfileData, updateProfileSchema } from "./schema";

export async function updateProfile(data: UpdateProfileData): Promise<{ success: boolean; message: string }> {
  const log = createLog("User Profile");

  log.info("Starting profile update", { data });

  try {
    // Get session and verify authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      log.warn("Unauthorized access attempt to update profile");
      return { success: false, message: "Not authenticated" };
    }

    log.auth("Profile update authorized", session.user.id);

    // Validate the data
    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      log.error("Profile data validation failed", z.prettifyError(validation.error));
      return { success: false, message: "Invalid data provided" };
    }

    const { name, image } = validation.data;

    // Update the user profile
    await db
      .update(users)
      .set({
        name,
        image: image || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    log.success("Profile updated successfully", { userId: session.user.id });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    log.error("Profile update failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}
