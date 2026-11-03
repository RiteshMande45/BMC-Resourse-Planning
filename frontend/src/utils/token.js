const TOKEN_KEY = 'bmc_auth_token';

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage issues
  }
}

/**
 * Decodes JWT payload without an external library.
 * Returns null if token is invalid.
 */
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
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
 * Checks whether token is expired based on exp claim.
 */
export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return false; // if no exp claim, assume valid
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowInSeconds;
}

