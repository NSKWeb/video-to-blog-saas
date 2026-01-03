import { NextRequest } from 'next/server';
import { successResponse, createdResponse } from '@/utils/api-response';
import { ValidationError, ExternalServiceError, VideoProcessingError, handleApiError } from '@/utils/error-handler';
import { logInfo, logError } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { isValidVideoUrl, fetchVideoWithAudio, cleanupTempFile } from '@/lib/video-fetcher';
import { transcribeFromFile } from '@/lib/deepgram';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      throw new ValidationError('Video URL is required');
    }

    if (typeof videoUrl !== 'string' || videoUrl.length > 2000) {
      throw new ValidationError('Invalid video URL format');
    }

    logInfo('Starting video processing', { videoUrl });

    if (!isValidVideoUrl(videoUrl)) {
      throw new VideoProcessingError('Invalid or unsupported video URL');
    }

    const videoJob = await prisma.videoJob.create({
      data: {
        videoUrl,
        status: 'processing',
        userId: 'system', // TODO: Get from authenticated user
      },
    });

    logInfo('Video job created', { jobId: videoJob.id });

    try {
      const videoInfo = await fetchVideoWithAudio(videoUrl, {
        maxSize: 500 * 1024 * 1024, // 500MB default
      });

      logInfo('Video downloaded and audio extracted', {
        jobId: videoJob.id,
        duration: videoInfo.duration,
        format: videoInfo.format,
      });

      const audioBuffer = await import('fs').then(fs => 
        fs.promises.readFile(videoInfo.audioPath)
      );

      const transcriptionResult = await transcribeFromFile(
        audioBuffer,
        'audio/mpeg',
        {
          model: 'nova-2',
          smartFormat: true,
        }
      );

      logInfo('Transcription completed', { jobId: videoJob.id, duration: transcriptionResult.duration });

      await cleanupTempFile(videoInfo.audioPath);

      const updatedJob = await prisma.videoJob.update({
        where: { id: videoJob.id },
        data: {
          status: 'completed',
          transcription: transcriptionResult.text,
        },
      });

      return createdResponse(
        {
          jobId: updatedJob.id,
          status: updatedJob.status,
          videoUrl: updatedJob.videoUrl,
          transcript: transcriptionResult.text,
          language: transcriptionResult.language,
          duration: transcriptionResult.duration,
        },
        'Video processing completed successfully'
      );

    } catch (error) {
      await prisma.videoJob.update({
        where: { id: videoJob.id },
        data: {
          status: 'failed',
        },
      });

      if (error instanceof ExternalServiceError) {
        throw error;
      }

      throw new VideoProcessingError(
        'Failed to process video',
        { videoUrl, error: error instanceof Error ? error.message : String(error) }
      );
    }

  } catch (error) {
    return handleApiError(error);
  }
}