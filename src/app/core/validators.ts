// Pure validation helpers, kept out of the components so they can be unit-tested
// on their own.

/** Returns the error message for an invalid username, or null when valid.
 *  Rules: required, max 24 chars, alphanumeric only. */
export function usernameError(value: string): string | null {
  if (value.length === 0) return 'please enter your username';
  if (value.length > 24) return 'Must not exceed 24 characters';
  if (/[^a-zA-Z0-9]/.test(value)) return 'Values must be alphanumeric';
  return null;
}

/** Whether a login API response represents a successful login. */
export function isLoginSuccess(result: Record<string, unknown>): boolean {
  return (
    result['loginStatus'] === 'success' ||
    result['status'] === true ||
    result['success'] === true
  );
}
