import { cookies } from "next/headers";

import { randomUUID } from "crypto";

const SESSION_ID_COOKIE = "zm_session_id";
const SESSION_ID_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Generate a new session ID for guest users
 */
export function generateSessionId(): string {
  return randomUUID();
}

/**
 * Get or create a session ID for guest users
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value;

  if (!sessionId) {
    sessionId = generateSessionId();
    cookieStore.set(SESSION_ID_COOKIE, sessionId, {
      maxAge: SESSION_ID_MAX_AGE,
      httpOnly: true,
      secure: true,
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
 */
export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_ID_COOKIE);
}
