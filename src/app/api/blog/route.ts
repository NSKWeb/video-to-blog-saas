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
    return errorResponse('This endpoint has been moved to POST /api/blog/generate. Please use the new endpoint for blog generation.');
  } catch (error) {
    return handleApiError(error);
  }
}
