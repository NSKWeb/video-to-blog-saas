import { NextResponse } from 'next/server';
import { logError, logDebug } from './logger';

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public errorCode: string = 'API_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: new Date().toISOString(),
        details: this.details,
      },
    };
  }
}

/**
 * Validation Error - for input validation failures
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error - for auth failures
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', details?: Record<string, unknown>) {
    super(message, 401, 'AUTH_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

/**
 * External Service Error - for API failures (OpenAI, Deepgram, WordPress, etc.)
 */
export class ExternalServiceError extends ApiError {
  constructor(
    service: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      `${service} service error: ${message}`,
      502,
      `${service.toUpperCase()}_SERVICE_ERROR`,
      details
    );
    this.name = 'ExternalServiceError';
  }
}

/**
 * Video Processing Error - for video fetching/transcription failures
 */
export class VideoProcessingError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 422, 'VIDEO_PROCESSING_ERROR', details);
    this.name = 'VideoProcessingError';
  }
}

/**
 * Not Found Error - for resources not found
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Rate Limit Error - for rate limit exceeded
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR', retryAfter ? { retryAfter } : undefined);
    this.name = 'RateLimitError';
  }
}

/**
 * Error code mappings for user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'The provided data is invalid. Please check your input.',
  AUTH_ERROR: 'Authentication failed. Please check your credentials.',
  OPENAI_SERVICE_ERROR: 'Failed to generate content using OpenAI. Please try again later.',
  DEEPGRAM_SERVICE_ERROR: 'Failed to transcribe audio. Please try again later.',
  WORDPRESS_SERVICE_ERROR: 'Failed to publish to WordPress. Please check your configuration.',
  VIDEO_PROCESSING_ERROR: 'Failed to process the video. Please ensure the URL is valid.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT_ERROR: 'Too many requests. Please try again later.',
};

/**
 * Get user-friendly error message from error code
 */
function getUserMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || 'An unexpected error occurred. Please try again later.';
}

/**
 * Handle API errors and return appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  logDebug('Handling API error', { errorType: typeof error });

  if (error instanceof ApiError) {
    logError(`${error.name}: ${error.message}`, {
      errorCode: error.errorCode,
      statusCode: error.statusCode,
      details: error.details,
    });

    return NextResponse.json(error.toJSON() as ErrorResponse, { status: error.statusCode });
  }

  if (error instanceof Error) {
    logError(`Unhandled Error: ${error.message}`, {
      name: error.name,
      stack: error.stack,
    });

    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isDevelopment() ? error.message : getUserMessage('INTERNAL_ERROR'),
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 500 });
  }

  logError('Unknown error type', { error });

  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: getUserMessage('UNKNOWN_ERROR'),
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: 500 });
}

/**
 * Check if running in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}
