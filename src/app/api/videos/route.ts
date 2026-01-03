import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse } from '@/utils/api-response';
import { handleApiError } from '@/utils/error-handler';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const videoJobs = await prisma.videoJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return successResponse(videoJobs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return errorResponse('Video URL is required', 400);
    }

    return createdResponse(
      {
        message: 'Video processing endpoint - implementation pending',
        videoUrl,
        placeholder: true,
      },
      'Video job will be created and processed in Task 2'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
