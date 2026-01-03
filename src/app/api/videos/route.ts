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
    return errorResponse('This endpoint has been moved to POST /api/videos/process. Please use the new endpoint for video processing.');
  } catch (error) {
    return handleApiError(error);
  }
}
