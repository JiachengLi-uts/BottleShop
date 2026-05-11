const TOKEN_KEY = 'bottle_shop_token';

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveAuthToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}
