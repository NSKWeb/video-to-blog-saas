/**
 * Deepgram client for audio/video transcription.
 * Provides functions to transcribe audio files from URLs or local files.
 */

import { createClient, DeepgramClient } from '@deepgram/sdk';
import { getConfig } from '@/lib/config';
import { logServiceCall, logError, logDebug } from '@/utils/logger';
import { ExternalServiceError } from '@/utils/error-handler';
import type { Transcript, DeepgramResponse } from '@/types';

/**
 * Initialize Deepgram client with API key from environment
 */
function createDeepgramClient(): DeepgramClient {
  const config = getConfig();

  return createClient(config.deepgram.apiKey);
}

/**
 * Get singleton Deepgram client instance
 */
let deepgramClient: DeepgramClient | null = null;

function getClient(): DeepgramClient {
  if (!deepgramClient) {
    deepgramClient = createDeepgramClient();
  }
  return deepgramClient;
}

/**
 * Transcribe audio from a URL
 * @param audioUrl - URL to the audio file
 * @param options - Transcription options
 * @returns Transcript with text, language, and confidence
 */
export async function transcribeFromUrl(
  audioUrl: string,
  options: {
    language?: string;
    model?: string;
    includeTimestamps?: boolean;
    includeSpeakerDiarization?: boolean;
  } = {}
): Promise<Transcript> {
  const startTime = Date.now();

  try {
    const client = getClient();
    const config = getConfig();

    logDebug('Transcribing audio from URL', {
      url: audioUrl,
      language: options.language || config.deepgram.language,
      model: options.model || config.deepgram.model,
    });

    // Configure transcription options
    const transcriptionOptions: Record<string, unknown> = {
      model: options.model || config.deepgram.model,
      language: options.language || config.deepgram.language,
      smart_format: true,
      paragraphs: true,
      punctuate: true,
      utterances: true,
    };

    if (options.includeTimestamps) {
      transcriptionOptions.timestamp = true;
    }

    if (options.includeSpeakerDiarization) {
      transcriptionOptions.diarize = true;
      transcriptionOptions.diarization_version = '0.1.0a';
    }

    // Call Deepgram API
    const { result, error } = await client.listen.prerecorded.transcribeUrl(
      { url: audioUrl },
      transcriptionOptions
    );

    if (error) {
      throw new ExternalServiceError('Deepgram', error.message || 'Transcription failed');
    }

    const duration = Date.now() - startTime;
    logServiceCall('Deepgram', 'transcribe from URL', duration, {
      duration: result.metadata.duration,
      model: options.model || config.deepgram.model,
    });

    // Parse Deepgram response
    return parseDeepgramResponse(result);
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ExternalServiceError) {
      throw error;
    }

    if (error instanceof Error) {
      // Handle specific Deepgram errors
      if (error.message.includes('401') || error.message.includes('403')) {
        logError('Deepgram authentication error', { error: error.message });
        throw new ExternalServiceError('Deepgram', 'Invalid API key');
      }

      if (error.message.includes('429')) {
        logError('Deepgram rate limit error', { error: error.message });
        // TODO: Implement retry logic with exponential backoff
        throw new ExternalServiceError('Deepgram', 'Rate limit exceeded');
      }

      if (error.message.includes('400')) {
        logError('Deepgram bad request', { error: error.message });
        throw new ExternalServiceError('Deepgram', 'Invalid audio file or URL');
      }

      logError('Deepgram API error', { error: error.message, duration });
      throw new ExternalServiceError('Deepgram', error.message);
    }

    logError('Unknown Deepgram error', { error, duration });
    throw new ExternalServiceError('Deepgram', 'Unknown error occurred');
  }
}

/**
 * Transcribe audio from a local file buffer
 * @param audioBuffer - Audio file buffer
 * @param mimeType - MIME type of the audio file
 * @param options - Transcription options
 * @returns Transcript with text, language, and confidence
 */
export async function transcribeFromFile(
  audioBuffer: Buffer,
  mimeType: string,
  options: {
    language?: string;
    model?: string;
    includeTimestamps?: boolean;
    includeSpeakerDiarization?: boolean;
  } = {}
): Promise<Transcript> {
  const startTime = Date.now();

  try {
    const client = getClient();
    const config = getConfig();

    logDebug('Transcribing audio from file', {
      size: audioBuffer.length,
      mimeType,
      language: options.language || config.deepgram.language,
      model: options.model || config.deepgram.model,
    });

    // Configure transcription options
    const transcriptionOptions: Record<string, unknown> = {
      model: options.model || config.deepgram.model,
      language: options.language || config.deepgram.language,
      smart_format: true,
      paragraphs: true,
      punctuate: true,
      utterances: true,
    };

    if (options.includeTimestamps) {
      transcriptionOptions.timestamp = true;
    }

    if (options.includeSpeakerDiarization) {
      transcriptionOptions.diarize = true;
      transcriptionOptions.diarization_version = '0.1.0a';
    }

    // Call Deepgram API
    const { result, error } = await client.listen.prerecorded.transcribeFile(
      audioBuffer,
      transcriptionOptions
    );

    if (error) {
      throw new ExternalServiceError('Deepgram', error.message || 'Transcription failed');
    }

    const duration = Date.now() - startTime;
    logServiceCall('Deepgram', 'transcribe from file', duration, {
      duration: result.metadata.duration,
      size: audioBuffer.length,
      model: options.model || config.deepgram.model,
    });

    // Parse Deepgram response
    return parseDeepgramResponse(result);
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ExternalServiceError) {
      throw error;
    }

    if (error instanceof Error) {
      logError('Deepgram file transcription error', { error: error.message, duration });
      throw new ExternalServiceError('Deepgram', error.message);
    }

    logError('Unknown Deepgram error', { error, duration });
    throw new ExternalServiceError('Deepgram', 'Unknown error occurred');
  }
}

/**
 * Parse Deepgram API response into our Transcript format
 * @param deepgramResponse - Deepgram API response
 * @returns Parsed transcript
 */
function parseDeepgramResponse(deepgramResponse: any): Transcript {
  const results = deepgramResponse.results;
  const metadata = deepgramResponse.metadata;

  // Get the best alternative from the first channel
  const channel = results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];

  if (!alternative || !alternative.transcript) {
    throw new ExternalServiceError('Deepgram', 'No transcript found in response');
  }

  // Extract words with timestamps if available
  const words = alternative.words?.map((word: any) => ({
    word: word.word,
    start: word.start,
    end: word.end,
    confidence: word.confidence,
    speaker: word.speaker,
  }));

  // Build transcript object
  const transcript: Transcript = {
    text: alternative.transcript,
    language: metadata?.language_info?.language || 'en-US',
    confidence: alternative.confidence || 0,
    duration: metadata?.duration,
    words: words,
  };

  return transcript;
}

/**
 * Validate audio URL
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export function isValidAudioUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Check protocol
    if (
      !['http:', 'https:'].includes(parsedUrl.protocol)
    ) {
      return false;
    }

    // Check for common audio file extensions
    const pathname = parsedUrl.pathname.toLowerCase();
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.wma', '.mp4', '.mov', '.webm'];

    return audioExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * Get supported audio formats
 * @returns Array of supported MIME types
 */
export function getSupportedAudioFormats(): string[] {
  return [
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/x-m4a',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
    'audio/x-ms-wma',
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ];
}

/**
 * Validate Deepgram API key
 * @returns True if API key is valid
 */
export async function validateDeepgramKey(): Promise<boolean> {
  try {
    const client = getClient();

    // Try to get project info to validate key
    const { result, error } = await client.manage.getProjects();

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    logError('Deepgram API key validation failed', { error });
    return false;
  }
}
