/**
 * JWT token utilities
 * Handles token creation, verification, and decoding
 */

import jwt from 'jsonwebtoken';
import { getConfig } from '@/lib/config';
import { logError, logDebug } from './logger';

/**
 * JWT payload interface
 */
export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Token options
 */
export interface TokenOptions {
  expiresIn?: string | number;
}

/**
 * Get JWT secret from environment
 * @throws Error if JWT_SECRET is not set
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * Default token expiry times
 */
export const TOKEN_EXPIRY = {
  AUTH: '7d', // 7 days for auth tokens
  REFRESH: '24h', // 24 hours for refresh tokens
  SHORT: '1h', // 1 hour for short-lived tokens
} as const;

/**
 * Sign a JWT token
 * @param userId - User ID to include in token
 * @param expiresIn - Token expiry time (default: 7 days)
 * @returns Signed JWT token
 */
export function signToken(
  userId: string,
  expiresIn: string | number = TOKEN_EXPIRY.AUTH
): string {
  try {
    const secret = getJwtSecret();
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId,
    };

    logDebug('Signing JWT token', { userId, expiresIn });

    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  } catch (error) {
    logError('Failed to sign JWT token', { error, userId });
    throw new Error('Token creation failed');
  }
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as JwtPayload;

    logDebug('JWT token verified', { userId: decoded.userId });

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logError('JWT token expired', { error });
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logError('Invalid JWT token', { error });
      throw new Error('Invalid token');
    } else {
      logError('Failed to verify JWT token', { error });
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Decode a JWT token without verification
 * Useful for debugging or getting token info without verifying signature
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    return decoded;
  } catch (error) {
    logError('Failed to decode JWT token', { error });
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - JWT token to check
 * @returns True if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    return true;
  }
}

/**
 * Get time remaining until token expires (in seconds)
 * @param token - JWT token to check
 * @returns Seconds remaining, or 0 if expired or invalid
 */
export function getTokenTimeRemaining(token: string): number {
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;
    return Math.max(0, remaining);
  } catch (error) {
    return 0;
  }
}
