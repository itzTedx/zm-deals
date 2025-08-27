import { DEADLINE_HOUR } from "../constants";

/**
 * Calculates the time until the next 2pm deadline
 * @returns Object with hours, minutes, and seconds until deadline
 */
export function getTimeUntilDeadline() {
  const now = new Date();
  const deadline = new Date();
  deadline.setHours(DEADLINE_HOUR, 0, 0, 0); // 2pm

  // If it's already past 2pm, set deadline to 2pm tomorrow
  if (now.getHours() >= DEADLINE_HOUR) {
    deadline.setDate(deadline.getDate() + 1);
  }

  const diffInMs = deadline.getTime() - now.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  return {
    hours: diffInHours,
    minutes: diffInMinutes % 60,
    seconds: diffInSeconds % 60,
  };
}

/**
 * Checks if the 2pm deadline has passed for today
 * @returns boolean indicating if deadline has passed
 */
export function isDeadlinePassed(): boolean {
  const now = new Date();
  return now.getHours() >= DEADLINE_HOUR;
}

/**
 * Gets the formatted delivery date (tomorrow)
 * @returns Formatted date string
 */
export function getDeliveryDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Gets the next deadline time
 * @returns Formatted deadline string
 */
export function getNextDeadline(): string {
  const now = new Date();
  if (now.getHours() >= DEADLINE_HOUR) {
    // If past 2pm, next deadline is tomorrow at 2pm
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(DEADLINE_HOUR, 0, 0, 0);
    return `${tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })} at 2:00 PM`;
  }
  // If before 2pm, deadline is today at 2pm
  return "Today at 2:00 PM";
}

/**
 * Checks if the deadline is urgent (less than specified minutes)
 * @param minutes - Number of minutes to consider urgent (default: 60)
 * @returns boolean indicating if deadline is urgent
 */
export function isDeadlineUrgent(minutes = 60): boolean {
  if (isDeadlinePassed()) return false;

  const timeComponents = getTimeUntilDeadline();
  const totalMinutes = timeComponents.hours * 60 + timeComponents.minutes;
  return totalMinutes <= minutes;
}

/**
 * Gets the urgency level based on time remaining
 * @returns 'low' | 'medium' | 'high' | 'critical'
 */
export function getUrgencyLevel(): "low" | "medium" | "high" | "critical" {
  if (isDeadlinePassed()) return "low";

  const timeComponents = getTimeUntilDeadline();
  const totalMinutes = timeComponents.hours * 60 + timeComponents.minutes;

  if (totalMinutes <= 30) return "critical";
  if (totalMinutes <= 60) return "high";
  if (totalMinutes <= 120) return "medium";
  return "low";
}

/**
 * Calculates progress percentage towards the deadline
 * @returns number between 0 and 100
 */
export function getDeadlineProgress(): number {
  if (isDeadlinePassed()) return 100;

  const now = new Date();
  const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // If before 2pm, calculate progress from midnight to 2pm (14 hours)
  if (now.getHours() < DEADLINE_HOUR) {
    const totalSecondsUntilDeadline = DEADLINE_HOUR * 3600; // 14 hours in seconds
    const elapsed = secondsSinceMidnight;
    return Math.max(0, Math.min(100, (elapsed / totalSecondsUntilDeadline) * 100));
  }

  return 100; // Past deadline
}
