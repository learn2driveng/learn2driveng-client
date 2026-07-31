const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN =
  /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const PASSWORD_REQUIREMENTS =
  "Use at least 8 characters with uppercase, lowercase, and a number or symbol.";

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function isStrongPassword(value: string) {
  return value.length >= 8 && PASSWORD_PATTERN.test(value);
}
