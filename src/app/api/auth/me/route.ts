/**
 * Get Current User API Endpoint
 * Returns the authenticated user's information
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/utils/auth-middleware';
import { successResponse } from '@/utils/api-response';
import { AuthenticationError } from '@/utils/error-handler';
import { withMiddleware } from '@/utils/api-middleware';
import { logInfo, logError } from '@/utils/logger';

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
async function handler(req: NextRequest) {
  try {
    const { userId, error } = await withAuth(req);

    if (error || !userId) {
      throw new AuthenticationError(error || 'Authentication required');
    }

    logInfo('Fetching current user', { userId });

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logError('User not found in database', { userId });
      throw new AuthenticationError('User not found');
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return successResponse(userResponse);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    logError('Get current user error', { error });
    throw new AuthenticationError('Failed to fetch user data');
  }
}

/**
 * Current user endpoint with middleware
 */
export const GET = withMiddleware(handler);
