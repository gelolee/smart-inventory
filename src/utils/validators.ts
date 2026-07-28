/**
 * Regular expression for validating email addresses.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns true if the email format is valid.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Returns true if the string is not empty after trimming.
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}
