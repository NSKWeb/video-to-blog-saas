import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationError } from './error-handler';
import { logDebug } from './logger';

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Authenticate a request and return the user
 * @param request - Next.js request object
 * @returns Authenticated user
 * @throws AuthenticationError if authentication fails
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthUser> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    logDebug('Authentication failed: Missing authorization header');
    throw new AuthenticationError('Authorization header is required');
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    logDebug('Authentication failed: Empty token');
    throw new AuthenticationError('Valid token is required');
  }

  // TODO: Implement actual JWT validation in Phase 2
  // For now, return placeholder user
  // This will be replaced with proper authentication logic
  logDebug('Authentication successful (placeholder)', { tokenLength: token.length });

  return {
    id: 'placeholder-user-id',
    email: 'placeholder@example.com',
  };
}

/**
 * Middleware wrapper to require authentication for API routes
 */
export function withAuth<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (request: NextRequest, ...args: any[]) => {
    try {
      // Authenticate request
      const user = await authenticateRequest(request);

      // Attach user to request for use in handler
      (request as any).user = user;

      // Call original handler
      return await handler(request, ...args);
    } catch (error) {
      throw error; // Re-throw to be caught by error handler
    }
  }) as T;
}
