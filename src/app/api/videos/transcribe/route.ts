import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/api-response';
import { ValidationError, NotFoundError, VideoProcessingError, handleApiError } from '@/utils/error-handler';
import { logInfo, logError } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { transcribeFromFile } from '@/lib/deepgram';
import { cleanupTempFile, readFileAsBuffer } from '@/lib/video-fetcher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, audioPath } = body;

    if (!jobId && !audioPath) {
      throw new ValidationError('Either jobId or audioPath must be provided');
    }

    let transcriptionResult;
    let job;

    if (jobId) {
      logInfo('Starting transcription for job', { jobId });

      job = await prisma.videoJob.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new NotFoundError('VideoJob', jobId);
      }

      if (job.transcription) {
        return successResponse({
          jobId,
          transcript: job.transcription,
          message: 'Transcription already exists',
        });
      }

      if (job.status === 'failed') {
        throw new VideoProcessingError('Cannot transcribe failed job');
      }

      // For demo purposes, simulate audio file
      // In production, you'd fetch the audio from where it was stored
      throw new ValidationError('Audio file path must be provided for transcription');
    }

    if (!audioPath) {
      throw new ValidationError('Audio file path is required');
    }

    logInfo('Transcribing audio file', { audioPath });

    const audioBuffer = await readFileAsBuffer(audioPath);
    
    transcriptionResult = await transcribeFromFile(
      audioBuffer,
      'audio/mpeg',
      {
        model: 'nova-2',
        smartFormat: true,
        utterances: true,
      }
    );

    logInfo('Transcription completed', {
      language: transcriptionResult.language,
      confidence: transcriptionResult.confidence,
      duration: transcriptionResult.duration,
    });

    await cleanupTempFile(audioPath);

    if (jobId && job) {
      await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          transcription: transcriptionResult.text,
          status: 'completed',
        },
      });
    }

    return successResponse({
      jobId: jobId || null,
      transcript: transcriptionResult.text,
      language: transcriptionResult.language,
      confidence: transcriptionResult.confidence,
      duration: transcriptionResult.duration,
      words: transcriptionResult.words,
    }, 'Transcription completed successfully');

  } catch (error) {
    return handleApiError(error);
  }
}