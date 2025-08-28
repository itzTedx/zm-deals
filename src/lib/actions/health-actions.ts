"use server";

import { revalidatePath } from "next/cache";

import { performSystemHealthCheck } from "@/lib/health/checks";

/**
 * Refresh system health status
 */
export async function refreshSystemHealth(): Promise<void> {
  try {
    // Perform the health check
    await performSystemHealthCheck();

    // Revalidate the admin dashboard to show fresh data
    revalidatePath("/studio");
  } catch (error) {
    console.error("Failed to refresh system health:", error);
    // Re-throw to let the UI handle the error
    throw error;
  }
}

/**
 * Get current system health status
 */
export async function getSystemHealth() {
  try {
    const health = await performSystemHealthCheck();
    return { success: true, data: health };
  } catch (error) {
    console.error("Failed to get system health:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get system health",
    };
  }
}
