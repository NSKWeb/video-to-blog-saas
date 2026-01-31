/**
 * Sign Up API Endpoint
 * Creates a new user account with email, password, and optional name
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePasswordStrength } from '@/utils/password';
import { signToken, TOKEN_EXPIRY } from '@/utils/jwt';
import { successResponse, createdResponse } from '@/utils/api-response';
import { ValidationError, AuthenticationError } from '@/utils/error-handler';
import { withMiddleware, withBodyValidation } from '@/utils/api-middleware';
import { logInfo, logError, logWarn } from '@/utils/logger';

/**
 * Sign Up Request Body
 */
interface SignUpRequestBody {
  email: string;
  password: string;
  name: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/auth/signup
 * Create a new user account
 */
async function handler(req: NextRequest) {
  try {
    const body: SignUpRequestBody = await req.json();
    const { email, password, name } = body;

    logInfo('Sign up attempt', { email });

    // Validate email format
    if (!email || !isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate name is not empty
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new ValidationError(
        'Password does not meet requirements',
        { errors: passwordValidation.errors }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      logWarn('Sign up failed: Email already exists', { email });
      throw new AuthenticationError('Email already registered', {
        email: 'Email already in use',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
      },
    });

    logInfo('User created successfully', { userId: user.id, email: user.email });

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

    return createdResponse(
      {
        token,
        user: userResponse,
        expiresIn: TOKEN_EXPIRY.AUTH,
      },
      'Account created successfully'
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthenticationError) {
      throw error;
    }

    logError('Sign up error', { error });
    throw new AuthenticationError('Failed to create account');
  }
}

/**
 * Sign up endpoint with middleware
 */
export const POST = withMiddleware(
  withBodyValidation<SignUpRequestBody>(['email', 'password', 'name'])(handler)
);
