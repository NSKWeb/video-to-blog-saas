import { NextRequest } from 'next/server';
import { createdResponse } from '@/utils/api-response';
import { ValidationError, handleApiError } from '@/utils/error-handler';
import { logInfo, logError } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { isValidVideoUrl, fetchVideoWithAudio, cleanupTempFile } from '@/lib/video-fetcher';
import { transcribeFromFile } from '@/lib/deepgram';
import { generateBlogPost } from '@/lib/openai';
import { publishBlogPostForUser } from '@/lib/wordpress-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, wordpressConfig, publishToWordPress = false } = body;

    if (!videoUrl) {
      throw new ValidationError('Video URL is required');
    }

    if (!isValidVideoUrl(videoUrl)) {
      throw new ValidationError('Invalid video URL format');
    }

    logInfo('Starting complete workflow', { videoUrl, publishToWordPress });

    // Step 1: Create initial job
    const videoJob = await prisma.videoJob.create({
      data: {
        videoUrl,
        status: 'processing',
        userId: 'system',
      },
    });

    try {
      // Step 2: Download and extract audio
      logInfo('Step 2: Downloading video and extracting audio', { jobId: videoJob.id });
      const videoInfo = await fetchVideoWithAudio(videoUrl);

      // Step 3: Transcribe audio
      logInfo('Step 3: Transcribing audio', { jobId: videoJob.id });
      const fs = await import('fs');
      const audioBuffer = await fs.promises.readFile(videoInfo.audioPath);
      
      const transcriptionResult = await transcribeFromFile(audioBuffer, 'audio/mpeg', {
        model: 'nova-2',
        smartFormat: true,
      });

      await cleanupTempFile(videoInfo.audioPath);

      // Step 4: Update job with transcription
      await prisma.videoJob.update({
        where: { id: videoJob.id },
        data: {
          transcription: transcriptionResult.text,
        },
      });

      // Step 5: Generate blog post
      logInfo('Step 5: Generating blog post', { jobId: videoJob.id });
      const blogResult = await generateBlogPost(transcriptionResult.text, undefined, {
        model: 'gpt-4o-mini',
        maxTokens: 4000,
      });

      // Step 6: Create blog post record
      const blogPost = await prisma.blogPost.create({
        data: {
          videoJobId: videoJob.id,
          title: blogResult.title,
          content: blogResult.content,
          wordCount: blogResult.wordCount,
          status: 'draft',
        },
      });

      // Step 7: Update job with blog data
      await prisma.videoJob.update({
        where: { id: videoJob.id },
        data: {
          blogPost: blogResult.content,
          status: 'completed',
        },
      });

      let wordpressResult = null;

      // Step 8: Publish to WordPress if requested
      if (publishToWordPress) {
        logInfo('Step 8: Publishing to WordPress', { jobId: videoJob.id });
        
        let wpConfig = wordpressConfig;
        if (!wpConfig) {
          // Try to fetch from database
          const dbConfig = await prisma.wordPressConfig.findUnique({
            where: { userId: 'system' },
          });
          if (dbConfig) {
            wpConfig = {
              siteUrl: dbConfig.siteUrl,
              username: dbConfig.username,
              appPassword: dbConfig.appPassword,
            };
          }
        }

        if (wpConfig) {
          wordpressResult = await publishBlogPostForUser('system', {
            title: blogPost.title,
            content: blogPost.content,
            status: 'publish',
            excerpt: blogPost.content.substring(0, 200) + '...',
          }, wpConfig);

          if (wordpressResult) {
            await prisma.blogPost.update({
              where: { id: blogPost.id },
              data: {
                wordpressPostId: wordpressResult.id.toString(),
                status: 'published',
              },
            });
          }
        }
      }

      const responseData = {
        jobId: videoJob.id,
        status: 'completed',
        videoUrl,
        transcript: transcriptionResult.text,
        blog: {
          id: blogPost.id,
          title: blogPost.title,
          content: blogPost.content,
          wordCount: blogPost.wordCount,
          status: wordpressResult ? 'published' : 'draft',
        },
        wordpress: wordpressResult ? {
          postId: wordpressResult.id,
          url: wordpressResult.url,
          status: 'published',
        } : null,
      };

      return createdResponse(responseData, 'Complete workflow completed successfully');

    } catch (error) {
      // Mark job as failed
      await prisma.videoJob.update({
        where: { id: videoJob.id },
        data: {
          status: 'failed',
        },
      });

      throw error;
    }

  } catch (error) {
    return handleApiError(error);
  }
}