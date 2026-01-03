import { NextRequest } from 'next/server';
import { successResponse } from '@/utils/api-response';
import { ValidationError, NotFoundError, handleApiError } from '@/utils/error-handler';
import { logInfo } from '@/utils/logger';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId || jobId.length !== 25) { // cuid length
      throw new ValidationError('Invalid job ID format');
    }

    logInfo('Fetching job status', { jobId });

    const videoJob = await prisma.videoJob.findUnique({
      where: { id: jobId },
      include: {
        blogPosts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!videoJob) {
      throw new NotFoundError('VideoJob', jobId);
    }

    const blogPost = videoJob.blogPosts[0];

    const responseData = {
      jobId: videoJob.id,
      videoUrl: videoJob.videoUrl,
      status: videoJob.status,
      transcription: videoJob.transcription,
      createdAt: videoJob.createdAt,
      updatedAt: videoJob.updatedAt,
      blog: blogPost ? {
        id: blogPost.id,
        title: blogPost.title,
        content: blogPost.content,
        wordCount: blogPost.wordCount,
        status: blogPost.status,
        wordpressPostId: blogPost.wordpressPostId,
        createdAt: blogPost.createdAt,
        updatedAt: blogPost.updatedAt,
      } : null,
    };

    return successResponse(responseData);

  } catch (error) {
    return handleApiError(error);
  }
}