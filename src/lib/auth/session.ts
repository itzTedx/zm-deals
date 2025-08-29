"use server";

import { cookies } from "next/headers";

import { randomUUID } from "crypto";

import { SESSION_ID_COOKIE, SESSION_ID_MAX_AGE } from "./constants";

/**
 * Get or create a session ID for guest users
 * Note: This function should only be called from server actions or route handlers
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    // Set the cookie using the proper Next.js 15 API
    cookieStore.set(SESSION_ID_COOKIE, sessionId, {
      maxAge: SESSION_ID_MAX_AGE,
      httpOnly: true,
      // biome-ignore lint/style/noProcessEnv: NODE_ENV is a standard Node.js environment variable
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return sessionId;
}

/**
 * Get the current session ID (returns null if not found)
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_ID_COOKIE)?.value || null;
}

/**
 * Clear the session ID cookie
 * Note: This function should only be called from server actions or route handlers
 */
export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_ID_COOKIE);
}
