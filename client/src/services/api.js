import { getAuthToken } from '../utils/authStorage';

export async function apiRequest(path, options) {
  const requestOptions = options || {};
  const headers = new Headers(requestOptions.headers || {});
  const token = getAuthToken();

  if (token) {
    headers.set('Authorization', 'Bearer ' + token);
  }

  if (requestOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...requestOptions,
    headers
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data && data.error ? data.error : 'Request failed';
    throw new Error(message);
  }

  return data;
}
