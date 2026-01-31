/**
 * Client-side token management utilities
 * Handles JWT token storage and retrieval from localStorage
 */

import { isTokenExpired } from './jwt';

/**
 * Storage key for JWT token
 */
const TOKEN_KEY = 'auth_token';

/**
 * Get JWT token from localStorage
 * @returns Token string or null
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Failed to get token from localStorage', error);
    return null;
  }
}

/**
 * Save JWT token to localStorage
 * @param token - Token string to save
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token to localStorage', error);
  }
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove token from localStorage', error);
  }
}

/**
 * Check if stored token is valid and not expired
 * @returns True if token is valid
 */
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}

/**
 * Clear all auth-related data from localStorage
 * Useful for logout
 */
export function clearAuthData(): void {
  removeToken();
  // You can also clear other auth-related data here
  // e.g., user data stored separately
}

/**
 * Get authorization header value with Bearer token
 * @returns Authorization header value or null
 */
export function getAuthHeader(): string | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  return `Bearer ${token}`;
}

/**
 * Set authorization header on a RequestInit object
 * @param options - RequestInit object to modify
 * @returns Modified RequestInit object
 */
export function withAuthHeader<T extends RequestInit>(
  options: T
): T & { headers: HeadersInit } {
  const authHeader = getAuthHeader();
  const headers = new Headers(options.headers || {});

  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  return { ...options, headers };
}

/**
 * Decode token without verification (client-side)
 * Useful for getting user ID from token
 * @returns Decoded payload or null
 */
export function decodeTokenClient(): { userId: string; exp: number } | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    return {
      userId: decoded.userId,
      exp: decoded.exp,
    };
  } catch (error) {
    console.error('Failed to decode token', error);
    return null;
  }
}
