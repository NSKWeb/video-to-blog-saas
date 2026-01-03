import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleApiError } from '@/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    return errorResponse('This endpoint has been moved to POST /api/wordpress/publish. Please use the new endpoint for WordPress publishing.');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    return errorResponse('This endpoint has been moved to GET /api/wordpress/config. Please use the new endpoint for WordPress configuration.');
  } catch (error) {
    return handleApiError(error);
  }
}
