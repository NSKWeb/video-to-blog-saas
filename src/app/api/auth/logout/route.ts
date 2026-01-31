/**
 * Logout API Endpoint
 * Handles user logout (client-side token clearing)
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/utils/auth-middleware';
import { successResponse } from '@/utils/api-response';
import { AuthenticationError } from '@/utils/error-handler';
import { withMiddleware } from '@/utils/api-middleware';
import { logInfo } from '@/utils/logger';

/**
 * POST /api/auth/logout
 * Logout user (client should clear token)
 */
async function handler(req: NextRequest) {
  try {
    const { userId, error } = await withAuth(req);

    if (error || !userId) {
      throw new AuthenticationError(error || 'Authentication required');
    }

    logInfo('User logged out', { userId });

    // Client should clear the token from localStorage
    // Server-side token blacklisting can be implemented here for enhanced security

    return successResponse({ message: 'Logged out successfully' }, 'Logged out');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    throw new AuthenticationError('Logout failed');
  }
}

/**
 * Logout endpoint with middleware
 */
export const POST = withMiddleware(handler);
