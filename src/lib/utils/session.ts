import { randomUUID } from "crypto";

/**
 * Generate a new session ID for guest users
 */
export function generateSessionId(): string {
  return randomUUID();
}
