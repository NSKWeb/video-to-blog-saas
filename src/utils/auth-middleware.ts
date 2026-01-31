/**
 * Authentication middleware for API routes
 * Provides JWT token verification and user extraction
 */

import { NextRequest } from 'next/server';
import { verifyToken, JwtPayload } from './jwt';
import { logError, logDebug } from './logger';
import { AuthenticationError } from './error-handler';

/**
 * Extended request with authenticated user
 */
export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Extract Bearer token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verify JWT token and extract user ID
 * @param token - JWT token
 * @returns Auth result with userId or error
 */
function verifyAuthToken(token: string): AuthResult {
  try {
    const payload = verifyToken(token);
    logDebug('Auth token verified', { userId: payload.userId });
    return { success: true, userId: payload.userId };
  } catch (error) {
    if (error instanceof Error) {
      logError('Auth token verification failed', { error: error.message });
      return { success: false, error: error.message };
    }
    logError('Auth token verification failed', { error });
    return { success: false, error: 'Token verification failed' };
  }
}

/**
 * Authentication middleware wrapper
 * Protects routes by requiring valid JWT token
 * Extracts userId from token and attaches to request
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { userId, error } = await withAuth(request);
 *   if (error) return errorResponse(error, 401);
 *
 *   // userId is now available
 *   const user = await prisma.user.findUnique({ where: { id: userId } });
 *   return successResponse(user);
 * }
 * ```
 *
 * @param request - Next.js request object
 * @returns Auth result with userId or error
 */
export async function withAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    logDebug('No auth token provided');
    return { success: false, error: 'No authorization token provided' };
  }

  const result = verifyAuthToken(token);
  return result;
}

/**
 * Optional authentication middleware wrapper
 * Checks for token but doesn't fail if missing
 * Useful for routes that work for both authenticated and unauthenticated users
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { userId } = await withOptionalAuth(request);
 *
 *   // userId is available if authenticated, undefined otherwise
 *   const data = userId
 *     ? await getPersonalizedData(userId)
 *     : await getPublicData();
 *   return successResponse(data);
 * }
 * ```
 *
 * @param request - Next.js request object
 * @returns Auth result with userId if authenticated
 */
export async function withOptionalAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    logDebug('No auth token provided (optional auth)');
    return { success: true };
  }

  const result = verifyAuthToken(token);
  return result;
}

/**
 * Middleware function wrapper for API routes
 * Wraps a handler with authentication requirement
 *
 * @example
 * ```typescript
 * import { withMiddleware } from '@/utils/api-middleware';
 * import { requireAuth } from '@/utils/auth-middleware';
 *
 * async function protectedHandler(req: NextRequest) {
 *   const userId = req.userId;
 *   return successResponse({ userId });
 * }
 *
 * export const GET = withMiddleware(requireAuth(protectedHandler));
 * ```
 *
 * @param handler - API route handler
 * @returns Wrapped handler that requires authentication
 */
export function requireAuth<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>
): (req: NextRequest, ...args: T) => Promise<Response> {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    const { userId, error } = await withAuth(req);

    if (error || !userId) {
      throw new AuthenticationError(error || 'Authentication required');
    }

    // Attach userId to request for handler use
    (req as any).userId = userId;

    return handler(req, ...args);
  };
}

/**
 * Check if a userId matches the authenticated user
 * Useful for ensuring users can only access their own resources
 *
 * @param requestUserId - User ID from request
 * @param resourceOwnerId - Owner ID of the resource
 * @returns True if user is authorized
 */
export function isResourceOwner(
  requestUserId: string,
  resourceOwnerId: string
): boolean {
  return requestUserId === resourceOwnerId;
}

/**
 * Throw error if user is not resource owner
 *
 * @param requestUserId - User ID from request
 * @param resourceOwnerId - Owner ID of the resource
 * @throws AuthenticationError if not authorized
 */
export function requireResourceOwner(
  requestUserId: string,
  resourceOwnerId: string
): void {
  if (!isResourceOwner(requestUserId, resourceOwnerId)) {
    throw new AuthenticationError('You do not have permission to access this resource');
  }
}
