/**
 * Video fetcher utility for downloading videos and extracting audio.
 * Handles various video formats and provides temporary file management.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logDebug, logError, logInfo } from '@/utils/logger';
import { VideoProcessingError } from '@/utils/error-handler';
import type { VideoFetchOptions, FetchedVideoInfo, AudioExtractionOptions } from '@/types';

/**
 * Default video fetch options
 */
const DEFAULT_OPTIONS: Required<VideoFetchOptions> = {
  maxSize: 500 * 1024 * 1024, // 500MB
  timeout: 30000, // 30 seconds
  allowedFormats: ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.flv', '.wmv'],
};

/**
 * Default audio extraction options
 */
const DEFAULT_AUDIO_OPTIONS: AudioExtractionOptions = {
  outputFormat: 'mp3',
  quality: 128, // 128 kbps
};

/**
 * Temporary directory for downloaded videos and extracted audio
 */
const TEMP_DIR = path.join(process.cwd(), '.temp');

/**
 * Ensure temporary directory exists
 */
async function ensureTempDir(): Promise<void> {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

/**
 * Generate unique filename for temporary files
 */
function generateTempFilename(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}${extension}`;
}

/**
 * Validate video URL
 */
function validateVideoUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);

    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new VideoProcessingError('URL must use HTTP or HTTPS protocol');
    }

    // Check file extension
    const pathname = parsedUrl.pathname.toLowerCase();
    const hasValidExtension = DEFAULT_OPTIONS.allowedFormats.some(ext => pathname.endsWith(ext));

    if (!hasValidExtension) {
      throw new VideoProcessingError(
        `Unsupported video format. Supported formats: ${DEFAULT_OPTIONS.allowedFormats.join(', ')}`
      );
    }
  } catch (error) {
    if (error instanceof VideoProcessingError) {
      throw error;
    }
    throw new VideoProcessingError('Invalid video URL');
  }
}

/**
 * Download video from URL
 * @param url - Video URL
 * @param options - Download options
 * @returns Path to downloaded file
 */
export async function downloadVideo(
  url: string,
  options: VideoFetchOptions = {}
): Promise<string> {
  const fetchOptions = { ...DEFAULT_OPTIONS, ...options };

  validateVideoUrl(url);

  await ensureTempDir();

  logDebug('Downloading video', {
    url,
    maxSize: fetchOptions.maxSize,
    timeout: fetchOptions.timeout,
  });

  const startTime = Date.now();

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetchOptions.timeout);

    // Fetch video
    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check response status
    if (!response.ok) {
      throw new VideoProcessingError(`Failed to download video: HTTP ${response.status}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.startsWith('video/')) {
      logDebug('Unexpected content type', { url, contentType });
      // Don't throw, just warn - some servers return wrong content type
    }

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > fetchOptions.maxSize) {
        throw new VideoProcessingError(
          `Video size (${Math.round(size / 1024 / 1024)}MB) exceeds maximum size (${Math.round(fetchOptions.maxSize / 1024 / 1024)}MB)`
        );
      }
    }

    // Get file extension from URL
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath) || '.mp4';

    // Generate temp file path
    const filename = generateTempFilename('video', extension);
    const filePath = path.join(TEMP_DIR, filename);

    // Download file in chunks to handle large files
    const writeStream = await fs.open(filePath, 'w');
    let downloadedBytes = 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new VideoProcessingError('Failed to read video stream');
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      downloadedBytes += value.length;

      // Check size limit
      if (downloadedBytes > fetchOptions.maxSize) {
        await writeStream.close();
        await fs.unlink(filePath).catch(() => {});
        throw new VideoProcessingError(
          `Video size (${Math.round(downloadedBytes / 1024 / 1024)}MB) exceeds maximum size (${Math.round(fetchOptions.maxSize / 1024 / 1024)}MB)`
        );
      }

      await writeStream.write(value);
    }

    await writeStream.close();

    const duration = Date.now() - startTime;
    logInfo('Video downloaded successfully', {
      url,
      filePath,
      size: downloadedBytes,
      duration,
    });

    return filePath;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof VideoProcessingError) {
      logError('Video download error', { error: error.message, duration });
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new VideoProcessingError('Download timed out');
      }

      logError('Unknown video download error', { error: error.message, duration });
      throw new VideoProcessingError(`Download failed: ${error.message}`);
    }

    throw new VideoProcessingError('Unknown error occurred while downloading video');
  }
}

/**
 * Extract audio from video file
 * Note: This is a simplified version. For production, use FFmpeg.
 * @param videoPath - Path to video file
 * @param options - Audio extraction options
 * @returns Path to extracted audio file
 */
export async function extractAudio(
  videoPath: string,
  options: AudioExtractionOptions = {}
): Promise<string> {
  const audioOptions = { ...DEFAULT_AUDIO_OPTIONS, ...options };

  await ensureTempDir();

  logDebug('Extracting audio from video', {
    videoPath,
    outputFormat: audioOptions.outputFormat,
  });

  // For MVP, we'll just rename the video file to indicate it should be used directly
  // In production, you would use FFmpeg to extract audio
  // Example: execSync(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ab "${audioOptions.quality}k" "${audioPath}"`);

  const videoFilename = path.basename(videoPath, path.extname(videoPath));
  const audioFilename = generateTempFilename('audio', `.${audioOptions.outputFormat}`);
  const audioPath = path.join(TEMP_DIR, audioFilename);

  // Copy video file as audio (placeholder - use FFmpeg in production)
  await fs.copyFile(videoPath, audioPath);

  logDebug('Audio extracted (placeholder)', {
    videoPath,
    audioPath,
    note: 'Using placeholder - implement FFmpeg for production',
  });

  return audioPath;
}

/**
 * Fetch video and extract audio
 * @param url - Video URL
 * @param options - Fetch and extraction options
 * @returns Video info with audio path
 */
export async function fetchVideoWithAudio(
  url: string,
  options: VideoFetchOptions & { audioOptions?: AudioExtractionOptions } = {}
): Promise<FetchedVideoInfo> {
  const startTime = Date.now();

  try {
    // Download video
    const videoPath = await downloadVideo(url, options);

    // Extract audio
    const audioPath = await extractAudio(videoPath, options.audioOptions);

    // Get file stats
    const stats = await fs.stat(videoPath);
    const extension = path.extname(url).toLowerCase();

    const duration = Date.now() - startTime;

    logInfo('Video fetched and audio extracted', {
      url,
      videoPath,
      audioPath,
      size: stats.size,
      format: extension,
      duration,
    });

    return {
      url,
      format: extension,
      size: stats.size,
      audioPath,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof VideoProcessingError) {
      logError('Video fetch with audio error', { error: error.message, duration });
      throw error;
    }

    logError('Unknown video fetch error', { error, duration });
    throw new VideoProcessingError('Failed to fetch video');
  }
}

/**
 * Clean up temporary files
 * @param filePath - Path to file to delete
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logDebug('Temporary file cleaned up', { filePath });
  } catch (error) {
    logError('Failed to clean up temporary file', { filePath, error });
  }
}

/**
 * Clean up all temporary files
 */
export async function cleanupAllTempFiles(): Promise<void> {
  try {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    logInfo('All temporary files cleaned up', { tempDir: TEMP_DIR });
  } catch (error) {
    logError('Failed to clean up temporary directory', { error });
  }
}

/**
 * Get size of temporary directory
 */
export async function getTempDirSize(): Promise<number> {
  try {
    await ensureTempDir();

    const files = await fs.readdir(TEMP_DIR);
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
    }

    return totalSize;
  } catch (error) {
    logError('Failed to get temp directory size', { error });
    return 0;
  }
}

/**
 * Read file as buffer
 * @param filePath - Path to file
 * @returns File buffer
 */
export async function readFileAsBuffer(filePath: string): Promise<Buffer> {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    logError('Failed to read file as buffer', { filePath, error });
    throw new VideoProcessingError('Failed to read file');
  }
}

/**
 * Get MIME type from file extension
 * @param extension - File extension (e.g., '.mp4')
 * @returns MIME type or 'application/octet-stream' if unknown
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
  };

  const normalizedExt = extension.toLowerCase();
  return mimeTypes[normalizedExt] || 'application/octet-stream';
}

/**
 * Check if URL is a valid video URL
 * @param url - URL to check
 * @returns True if URL appears to be a video URL
 */
export function isValidVideoUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Check file extension
    const pathname = parsedUrl.pathname.toLowerCase();
    return DEFAULT_OPTIONS.allowedFormats.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}
