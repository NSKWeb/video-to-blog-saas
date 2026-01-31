import { NextRequest } from 'next/server';
import { createdResponse, successResponse } from '@/utils/api-response';
import { ValidationError, NotFoundError, ExternalServiceError, handleApiError } from '@/utils/error-handler';
import { logInfo, logError } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { generateBlogPost } from '@/lib/openai';
import type { SEOMetadata } from '@/types';
import { withAuth, requireResourceOwner } from '@/utils/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const { userId, error: authError } = await withAuth(request);

    if (authError || !userId) {
      return handleApiError(new Error(authError || 'Authentication required'));
    }

    const body = await request.json();
    const { jobId, transcript, titleSuggestion } = body;

    if (!jobId && !transcript) {
      throw new ValidationError('Either jobId or transcript must be provided');
    }

    let finalTranscript: string;
    let videoJob;
    let userIdToUse = userId;

    if (jobId) {
      logInfo('Starting blog generation for job', { jobId, userId });

      videoJob = await prisma.videoJob.findUnique({
        where: { id: jobId },
        include: {
          blogPosts: true,
        },
      });

      if (!videoJob) {
        throw new NotFoundError('VideoJob', jobId);
      }

      // Verify user owns this video job
      requireResourceOwner(userId, videoJob.userId);
      userIdToUse = videoJob.userId;

      if (videoJob.blogPosts.length > 0) {
        const existingBlog = videoJob.blogPosts[0];
        return successResponse({
          blogId: existingBlog.id,
          title: existingBlog.title,
          content: existingBlog.content,
          wordCount: existingBlog.wordCount,
          status: existingBlog.status,
          message: 'Blog post already exists',
        });
      }

      if (!videoJob.transcription) {
        throw new ValidationError('No transcript available for this job');
      }

      finalTranscript = videoJob.transcription;
    } else {
      finalTranscript = transcript;
    }

    if (!finalTranscript || finalTranscript.trim().length === 0) {
      throw new ValidationError('Transcript cannot be empty');
    }

    if (finalTranscript.length > 500000) {
      throw new ValidationError('Transcript is too long (max 500,000 characters)');
    }

    logInfo('Generating blog post from transcript', {
      transcriptLength: finalTranscript.length,
      hasTitleSuggestion: !!titleSuggestion,
    });

    const blogResult = await generateBlogPost(finalTranscript, titleSuggestion, {
      model: 'gpt-4o-mini',
      maxTokens: 4000,
      temperature: 0.7,
    });

    logInfo('Blog post generated successfully', {
      title: blogResult.title,
      wordCount: blogResult.wordCount,
    });

    // Create blog post record
    const blogPost = await prisma.blogPost.create({
      data: {
        userId: userIdToUse,
        videoJobId: jobId || 'manual',
        title: blogResult.title,
        content: blogResult.content,
        wordCount: blogResult.wordCount,
        status: 'draft',
      },
    });

    // Update video job if it exists
    if (jobId && videoJob) {
      await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          blogPost: blogResult.content,
        },
      });
    }

    return createdResponse({
      blogId: blogPost.id,
      title: blogPost.title,
      content: blogPost.content,
      wordCount: blogPost.wordCount,
      seoMetadata: blogResult.seoMetadata,
    }, 'Blog post generated successfully');

  } catch (error) {
    return handleApiError(error);
  }
}