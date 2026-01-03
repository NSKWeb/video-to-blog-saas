import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleApiError } from '@/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blogPostId, wordpressConfig } = body;

    if (!blogPostId || !wordpressConfig) {
      return errorResponse('blogPostId and wordpressConfig are required', 400);
    }

    return successResponse(
      {
        message: 'WordPress publishing endpoint - implementation pending',
        blogPostId,
        placeholder: true,
      },
      'WordPress publishing will be implemented in Task 2'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    return successResponse(
      {
        message: 'WordPress configuration endpoint - implementation pending',
        placeholder: true,
      },
      'WordPress configuration management will be implemented in Task 2'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
