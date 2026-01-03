import { NextRequest } from 'next/server';
import { ApiError } from './error-handler';

export interface AuthUser {
  id: string;
  email: string;
}

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthUser> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    throw new ApiError('Authorization header is required', 401);
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    throw new ApiError('Valid token is required', 401);
  }

  return {
    id: 'placeholder-user-id',
    email: 'placeholder@example.com',
  };
}
