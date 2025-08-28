"use client";

import { recordProductView } from "./recently-viewed";

/**
 * Record a product view for the current user
 * This should be called when a user visits a product page
 */
export async function trackProductView(productId: string): Promise<void> {
  try {
    // Get session ID from localStorage or generate one for anonymous users
    let sessionId = localStorage.getItem("anonymous_session_id");

    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("anonymous_session_id", sessionId);
    }

    // Record the product view
    await recordProductView(productId, sessionId);
  } catch (error) {
    // Silently fail - don't break the user experience
    console.warn("Failed to track product view:", error);
  }
}

/**
 * Get session ID for anonymous users
 */
export function getAnonymousSessionId(): string {
  let sessionId = localStorage.getItem("anonymous_session_id");

  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("anonymous_session_id", sessionId);
  }

  return sessionId;
}
