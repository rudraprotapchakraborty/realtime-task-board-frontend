/**
 * Only allow redirects to a path inside this site. A `from` value such as
 * "https://evil.example" or "//evil.example" would otherwise turn the login
 * page into an open redirect.
 */
export function safeRedirectPath(value, fallback) {
  if (!value || typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  // never bounce back into the auth screens
  if (/^\/(login|register|forgot-password|verify-email)(\/|\?|$)/.test(value)) return fallback;
  return value;
}
