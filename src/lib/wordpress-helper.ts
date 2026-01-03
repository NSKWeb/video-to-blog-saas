/**
 * WordPress helper utilities for fetching configs and publishing posts.
 * Integrates with the database to retrieve WordPress configurations.
 */

import { getClient as getPrismaClient } from '@/lib/prisma';
import { createWordPressClient } from '@/lib/wordpress';
import type { WordPressResponse, WordPressPostData, WordPressConfig } from '@/types';
import { NotFoundError, AuthenticationError, ExternalServiceError } from '@/utils/error-handler';
import { logError, logDebug } from '@/utils/logger';

/**
 * Get WordPress configuration for a user from database
 * @param userId - User ID
 * @returns WordPress configuration
 */
export async function getWordPressConfigByUserId(userId: string): Promise<WordPressConfig> {
  logDebug('Fetching WordPress config', { userId });

  const prisma = getPrismaClient();

  try {
    const config = await prisma.wordPressConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      throw new NotFoundError('WordPress configuration');
    }

    return config;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logError('Failed to fetch WordPress config', { userId, error });
    throw new ExternalServiceError('Database', 'Failed to fetch WordPress configuration');
  }
}

/**
 * Create WordPress client from user's database configuration
 * @param userId - User ID
 * @returns WordPress client instance
 */
export async function getWordPressClientForUser(userId: string): Promise<any> {
  try {
    const config = await getWordPressConfigByUserId(userId);

    return createWordPressClient({
      siteUrl: config.siteUrl,
      username: config.username,
      appPassword: config.appPassword,
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ExternalServiceError) {
      throw error;
    }

    logError('Failed to create WordPress client for user', { userId, error });
    throw new ExternalServiceError('WordPress', 'Failed to create WordPress client');
  }
}

/**
 * Publish blog post to WordPress for a user
 * @param userId - User ID
 * @param postData - Blog post data
 * @returns WordPress post ID and URL
 */
export async function publishBlogPostForUser(
  userId: string,
  postData: WordPressPostData
): Promise<WordPressResponse> {
  logDebug('Publishing blog post for user', { userId, title: postData.title });

  try {
    const client = await getWordPressClientForUser(userId);

    // Test connection first
    const isConnected = await client.testConnection();
    if (!isConnected) {
      throw new AuthenticationError('WordPress connection failed');
    }

    // Publish post
    return await client.publishPost(postData);
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
      throw error;
    }

    logError('Failed to publish blog post for user', { userId, error });
    throw new ExternalServiceError('WordPress', 'Failed to publish blog post');
  }
}

/**
 * Update WordPress post for a user
 * @param userId - User ID
 * @param postId - WordPress post ID
 * @param postData - Updated post data
 * @returns Updated WordPress post
 */
export async function updateBlogPostForUser(
  userId: string,
  postId: number,
  postData: Partial<WordPressPostData>
): Promise<WordPressResponse> {
  logDebug('Updating WordPress post for user', { userId, postId });

  try {
    const client = await getWordPressClientForUser(userId);

    return await client.updatePost(postId, postData);
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
      throw error;
    }

    logError('Failed to update WordPress post for user', { userId, postId, error });
    throw new ExternalServiceError('WordPress', 'Failed to update blog post');
  }
}

/**
 * Delete WordPress post for a user
 * @param userId - User ID
 * @param postId - WordPress post ID
 * @param force - Permanently delete if true
 */
export async function deleteBlogPostForUser(
  userId: string,
  postId: number,
  force: boolean = false
): Promise<void> {
  logDebug('Deleting WordPress post for user', { userId, postId, force });

  try {
    const client = await getWordPressClientForUser(userId);

    await client.deletePost(postId, force);
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
      throw error;
    }

    logError('Failed to delete WordPress post for user', { userId, postId, error });
    throw new ExternalServiceError('WordPress', 'Failed to delete blog post');
  }
}

/**
 * Upload media to WordPress for a user
 * @param userId - User ID
 * @param fileBuffer - File buffer
 * @param filename - File name
 * @param mimeType - MIME type
 * @param options - Media options
 * @returns WordPress media object
 */
export async function uploadMediaForUser(
  userId: string,
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  options: {
    altText?: string;
    caption?: string;
  } = {}
) {
  logDebug('Uploading media to WordPress for user', { userId, filename, mimeType });

  try {
    const client = await getWordPressClientForUser(userId);

    return await client.uploadMedia(fileBuffer, filename, mimeType, options);
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
      throw error;
    }

    logError('Failed to upload media for user', { userId, filename, error });
    throw new ExternalServiceError('WordPress', 'Failed to upload media');
  }
}

/**
 * Get WordPress categories for a user's site
 * @param userId - User ID
 * @returns WordPress categories
 */
export async function getWordPressCategoriesForUser(userId: string) {
  logDebug('Fetching WordPress categories for user', { userId });

  try {
    const client = await getWordPressClientForUser(userId);

    return await client.getCategories();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
      throw error;
    }

    logError('Failed to fetch WordPress categories for user', { userId, error });
    throw new ExternalServiceError('WordPress', 'Failed to fetch categories');
  }
}

/**
 * Get WordPress tags for a user's site
 * @param userId - User ID
 * @returns WordPress tags
 */
export async function getWordPressTagsForUser(userId: string) {
  logDebug('Fetching WordPress tags for user', { userId });

  try {
    const client = await getWordPressClientForUser(userId);

    return await client.getTags();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
      throw error;
    }

    logError('Failed to fetch WordPress tags for user', { userId, error });
    throw new ExternalServiceError('WordPress', 'Failed to fetch tags');
  }
}

/**
 * Test WordPress connection for a user
 * @param userId - User ID
 * @returns True if connection successful
 */
export async function testWordPressConnectionForUser(userId: string): Promise<boolean> {
  logDebug('Testing WordPress connection for user', { userId });

  try {
    const client = await getWordPressClientForUser(userId);

    return await client.testConnection();
  } catch (error) {
    logError('WordPress connection test failed for user', { userId, error });
    return false;
  }
}
