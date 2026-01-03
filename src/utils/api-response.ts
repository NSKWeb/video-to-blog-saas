import { NextResponse } from 'next/server';
import { logDebug } from './logger';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Success response with data and optional message
 */
export function successResponse<T>(data: T, message?: string) {
  logDebug('Sending success response', { hasMessage: !!message });

  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

/**
 * Error response (deprecated - use handleApiError instead)
 * Kept for backward compatibility, but prefer using ApiError classes
 */
export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'API_ERROR',
        message: error,
        statusCode: status,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Created response (201) with data and optional message
 */
export function createdResponse<T>(data: T, message?: string) {
  logDebug('Sending created response', { hasMessage: !!message });

  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 201 }
  );
}

/**
 * No content response (204)
 */
export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}
