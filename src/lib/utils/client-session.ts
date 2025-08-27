/**
 * Get the current session ID from cookies (client-side)
 */
export function getClientSessionId(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith("zm_session_id="));

  if (sessionCookie) {
    return sessionCookie.split("=")[1];
  }

  return null;
}

/**
 * Generate a new session ID for client-side use
 */
export function generateClientSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Set session ID in cookies (client-side)
 */
export function setClientSessionId(sessionId: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `zm_session_id=${sessionId}; max-age=${maxAge}; path=/; secure; samesite=lax`;
}

/**
 * Get or create session ID for client-side use
 */
export function getOrCreateClientSessionId(): string {
  let sessionId = getClientSessionId();

  if (!sessionId) {
    sessionId = generateClientSessionId();
    setClientSessionId(sessionId);
  }

  return sessionId;
}
