/**
 * API middleware for Next.js route handlers.
 * Provides request validation, error handling, and logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logRequest, logError, logInfo, logDebug } from './logger';
import { handleApiError } from './error-handler';

/**
 * Middleware handler function signature
 */
export type MiddlewareHandler = (
  req: NextRequest,
  params?: Record<string, string>
) => Promise<NextResponse>;

/**
 * Wrapper to catch errors in API route handlers
 * Provides consistent error handling and logging
 */
export function withErrorHandler(handler: MiddlewareHandler): MiddlewareHandler {
  return async (req: NextRequest, params?: Record<string, string>) => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    try {
      // Attach request ID to request headers for tracing
      const response = await handler(req, params);

      // Log successful request
      const duration = Date.now() - startTime;
      logRequest(req.method, req.url, response.status, duration, {
        requestId,
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (error) {
      // Handle error
      const duration = Date.now() - startTime;
      logRequest(req.method, req.url, 500, duration, {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });

      return handleApiError(error);
    }
  };
}

/**
 * Middleware to validate JSON body in requests
 * Returns 400 if body is invalid JSON
 */
export function withJsonBodyValidation(handler: MiddlewareHandler): MiddlewareHandler {
  return async (req: NextRequest, params?: Record<string, string>) => {
    const contentType = req.headers.get('content-type');

    // Check if content-type is JSON
    if (req.method !== 'GET' && req.method !== 'HEAD' && contentType) {
      if (!contentType.includes('application/json')) {
        logDebug('Invalid content type', {
          expected: 'application/json',
          received: contentType,
        });
        const error = {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: 'Content-Type must be application/json',
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        };
        return NextResponse.json(error, { status: 400 });
      }

      // Validate JSON body exists for POST/PUT/PATCH
      if (
        (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') &&
        !req.body
      ) {
        logDebug('Empty request body', { method: req.method });
        const error = {
          success: false,
          error: {
            code: 'MISSING_BODY',
            message: 'Request body is required',
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        };
        return NextResponse.json(error, { status: 400 });
      }
    }

    return handler(req, params);
  };
}

/**
 * Middleware to validate required fields in request body
 */
export function withBodyValidation<T extends Record<string, unknown>>(
  requiredFields: (keyof T)[]
): (handler: MiddlewareHandler) => MiddlewareHandler {
  return (handler: MiddlewareHandler) => {
    return async (req: NextRequest, params?: Record<string, string>) => {
      try {
        const body = await req.json();

        // Validate required fields
        const missingFields = requiredFields.filter((field) => !(field in body) || body[field] === null || body[field] === undefined);

        if (missingFields.length > 0) {
          logDebug('Missing required fields', { missingFields });
          const error = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `Missing required fields: ${missingFields.join(', ')}`,
              statusCode: 400,
              timestamp: new Date().toISOString(),
              details: { missingFields },
            },
          };
          return NextResponse.json(error, { status: 400 });
        }

        return handler(req, params);
      } catch (error) {
        // If JSON parsing fails, let the error handler deal with it
        return handler(req, params);
      }
    };
  };
}

/**
 * Middleware for request logging
 * Logs all incoming requests
 */
export function withLogging(handler: MiddlewareHandler): MiddlewareHandler {
  return async (req: NextRequest, params?: Record<string, string>) => {
    const requestId = generateRequestId();

    logInfo('Incoming request', {
      method: req.method,
      url: req.url,
      requestId,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    });

    return handler(req, params);
  };
}

/**
 * Simple in-memory rate limiter
 * Note: For production, use Redis or a proper rate limiting service
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Middleware for basic rate limiting (in-memory)
 * @param requests - Max requests per window
 * @param windowMs - Time window in milliseconds
 */
export function withRateLimit(
  requests: number = 100,
  windowMs: number = 60000
): (handler: MiddlewareHandler) => MiddlewareHandler {
  return (handler: MiddlewareHandler) => {
    return async (req: NextRequest, params?: Record<string, string>) => {
      // Get client identifier (IP address)
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const key = `rate_limit:${ip}`;
      const now = Date.now();

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetTime) {
        // Reset rate limit
        entry = {
          count: 0,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
      }

      // Check if rate limit exceeded
      if (entry.count >= requests) {
        logDebug('Rate limit exceeded', { ip, count: entry.count });
        const error = {
          success: false,
          error: {
            code: 'RATE_LIMIT_ERROR',
            message: 'Too many requests. Please try again later.',
            statusCode: 429,
            timestamp: new Date().toISOString(),
            details: {
              retryAfter: Math.ceil((entry.resetTime - now) / 1000),
            },
          },
        };
        return NextResponse.json(error, {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': requests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
          },
        });
      }

      // Increment counter
      entry.count++;
      rateLimitStore.set(key, entry);

      // Add rate limit headers to response
      const response = await handler(req, params);
      response.headers.set('X-RateLimit-Limit', requests.toString());
      response.headers.set('X-RateLimit-Remaining', (requests - entry.count).toString());
      response.headers.set('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

      return response;
    };
  };
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Combined middleware wrapper for common use cases
 * Applies error handling, logging, and JSON validation
 */
export function withMiddleware(handler: MiddlewareHandler): MiddlewareHandler {
  return withErrorHandler(withLogging(handler));
}

/**
 * Combined middleware wrapper with rate limiting
 */
export function withRateLimitMiddleware(
  requests: number = 100,
  windowMs: number = 60000
): (handler: MiddlewareHandler) => MiddlewareHandler {
  return (handler: MiddlewareHandler) => {
    return withRateLimit(requests, windowMs)(withErrorHandler(withLogging(handler)));
  };
}
