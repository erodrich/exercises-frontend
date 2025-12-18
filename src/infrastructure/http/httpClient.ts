/**
 * HTTP Client with JWT Authentication
 * Automatically adds JWT token to requests
 */

const TOKEN_KEY = 'auth_token';

export interface HttpClientOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Make an authenticated HTTP request
 */
export async function httpClient(
  url: string,
  options: HttpClientOptions = {}
): Promise<Response> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  // Build headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add JWT token if authentication is required
  if (requiresAuth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  // Make request
  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401 && requiresAuth) {
    // Clear auth state
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('current_user');
    
    // Redirect to login (or let the app handle it)
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  return response;
}

/**
 * GET request
 */
export async function get<T>(url: string, options?: HttpClientOptions): Promise<T> {
  const response = await httpClient(url, {
    ...options,
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST request
 */
export async function post<T>(
  url: string,
  data?: unknown,
  options?: HttpClientOptions
): Promise<T> {
  const response = await httpClient(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * PUT request
 */
export async function put<T>(
  url: string,
  data?: unknown,
  options?: HttpClientOptions
): Promise<T> {
  const response = await httpClient(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * DELETE request
 */
export async function del<T>(url: string, options?: HttpClientOptions): Promise<T> {
  const response = await httpClient(url, {
    ...options,
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // DELETE might not return content
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Export all methods
 */
export default {
  get,
  post,
  put,
  delete: del,
  httpClient,
};
