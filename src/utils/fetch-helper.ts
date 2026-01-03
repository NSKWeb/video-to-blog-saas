/**
 * API fetch helper for making HTTP requests to the backend API
 * Provides consistent error handling and response parsing
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  includeAuth?: boolean;
}

export class ApiError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Make an API request with error handling and timeout support
 */
export async function apiRequest<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 30000, includeAuth = false, ...fetchOptions } = options;

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token if needed (for future auth implementation)
  if (includeAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });

  try {
    const response = await Promise.race([
      fetch(url, { ...fetchOptions, headers }),
      timeoutPromise,
    ]);

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'An error occurred',
        response.status,
        data.details
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.message === 'Request timeout') {
      throw new ApiError('Request timeout', 408);
    }

    throw new ApiError('Network error or server unavailable', 0);
  }
}

/**
 * HTTP method helpers
 */
export const api = {
  get: <T>(url: string, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),

  patch: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
};
