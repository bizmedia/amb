let warnedAboutDevSecret = false;

/**
 * Resolve JWT secret for signing/verifying tokens.
 * In development we allow a fallback to keep local onboarding friction low.
 */
export function resolveJwtSecret(): string | null {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV !== "production") {
    if (!warnedAboutDevSecret) {
      warnedAboutDevSecret = true;
      console.warn(
        "[auth] JWT_SECRET is not configured. Using development fallback secret."
      );
    }
    return "amb-dev-jwt-secret";
  }

  return null;
}
