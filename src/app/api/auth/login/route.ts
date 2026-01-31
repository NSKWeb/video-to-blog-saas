/**
 * Login API Endpoint
 * Authenticates user with email and password
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/utils/password';
import { signToken, TOKEN_EXPIRY } from '@/utils/jwt';
import { successResponse } from '@/utils/api-response';
import { ValidationError, AuthenticationError } from '@/utils/error-handler';
import { withMiddleware, withBodyValidation, withRateLimit } from '@/utils/api-middleware';
import { logInfo, logWarn, logError } from '@/utils/logger';

/**
 * Login Request Body
 */
interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
async function handler(req: NextRequest) {
  try {
    const body: LoginRequestBody = await req.json();
    const { email, password } = body;

    logInfo('Login attempt', { email });

    // Validate email format
    if (!email || !isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password is not empty
    if (!password || typeof password !== 'string' || password.length === 0) {
      throw new ValidationError('Password is required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      logWarn('Login failed: User not found', { email });
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      logWarn('Login failed: Invalid password', { email });
      throw new AuthenticationError('Invalid credentials');
    }

    logInfo('User logged in successfully', { userId: user.id, email: user.email });

    // Generate JWT token
    const token = signToken(user.id, TOKEN_EXPIRY.AUTH);

    // Return user data and token
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return successResponse(
      {
        token,
        user: userResponse,
        expiresIn: TOKEN_EXPIRY.AUTH,
      },
      'Login successful'
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthenticationError) {
      throw error;
    }

    logError('Login error', { error });
    throw new AuthenticationError('Login failed');
  }
}

/**
 * Login endpoint with middleware and rate limiting
 * Max 5 login attempts per IP per 15 minutes
 */
export const POST = withMiddleware(
  withRateLimit(5, 15 * 60 * 1000)(
    withBodyValidation<LoginRequestBody>(['email', 'password'])(handler)
  )
);
