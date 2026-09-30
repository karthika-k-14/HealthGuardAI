/**
 * Safely parse a JWT payload without external libraries.
 * @param {string} token
 * @returns {object|null}
 */
export function parseJwt(token) {
  if (!token || typeof token !== 'string' || token.startsWith('guest-local-')) {
    return null;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check whether a JWT token is expired.
 * @param {string} token
 * @returns {boolean} true if token is missing or expired, false otherwise
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  if (token.startsWith('guest-local-')) return false;

  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;

  // payload.exp is in seconds; Date.now() is in milliseconds
  return payload.exp * 1000 <= Date.now();
}
