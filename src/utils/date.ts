/**
 * Formats a Date object into MM/DD/YYYY string format,
 * matching the format used for Product.purchaseDate throughout the app.
 */
export function formatDateMMDDYYYY(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Parses an MM/DD/YYYY string (as stored in Product.purchaseDate) back
 * into a real Date object. Returns null if the string is malformed.
 */
export function parseMMDDYYYY(dateString: string): Date | null {
  const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, mm, dd, yyyy] = match;
  const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));

  // Guard against invalid dates like 02/30/2026 silently rolling over
  // to March 2nd — Date's constructor doesn't reject these by default.
  if (
    parsed.getFullYear() !== Number(yyyy) ||
    parsed.getMonth() !== Number(mm) - 1 ||
    parsed.getDate() !== Number(dd)
  ) {
    return null;
  }

  return parsed;
}

/**
 * Returns a time-of-day greeting ("Good Morning" / "Good Afternoon" /
 * "Good Evening") based on the current local hour. Used on the Dashboard.
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
