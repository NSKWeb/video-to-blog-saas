import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse } from '@/utils/api-response';
import { handleApiError } from '@/utils/error-handler';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        videoJob: true,
      },
    });

    return successResponse(blogPosts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoJobId, title, content } = body;

    if (!videoJobId || !title || !content) {
      return errorResponse('videoJobId, title, and content are required', 400);
    }

    return createdResponse(
      {
        message: 'Blog generation endpoint - implementation pending',
        videoJobId,
        title,
        placeholder: true,
      },
      'Blog post generation will be implemented in Task 2'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
