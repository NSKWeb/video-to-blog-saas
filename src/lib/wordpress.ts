/**
 * WordPress REST API client for publishing blog posts.
 * Provides functions to publish posts to WordPress sites.
 */

import { logServiceCall, logError, logDebug } from '@/utils/logger';
import { ExternalServiceError, AuthenticationError } from '@/utils/error-handler';
import type {
  WordPressConfig,
  WordPressPostData,
  WordPressResponse,
  WordPressCategory,
  WordPressTag,
  WordPressMedia,
} from '@/types';

/**
 * WordPress REST API client
 */
class WordPressClient {
  private siteUrl: string;
  private username: string;
  private appPassword: string;

  constructor(config: { siteUrl: string; username: string; appPassword: string }) {
    this.siteUrl = this.normalizeUrl(config.siteUrl);
    this.username = config.username;
    this.appPassword = config.appPassword;
  }

  /**
   * Normalize site URL to ensure proper format
   */
  private normalizeUrl(url: string): string {
    // Remove trailing slash
    let normalized = url.replace(/\/$/, '');

    // Ensure protocol
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    return normalized;
  }

  /**
   * Get base64 encoded auth credentials
   */
  private getAuthHeader(): string {
    const credentials = `${this.username}:${this.appPassword}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  /**
   * Make authenticated request to WordPress REST API
   */
  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: unknown;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body } = options;

    try {
      const url = `${this.siteUrl}/wp-json/wp/v2/${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: this.getAuthHeader(),
      };

      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new AuthenticationError('WordPress authentication failed');
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new ExternalServiceError('WordPress', `API error: ${response.status} - ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new ExternalServiceError('WordPress', error.message);
      }

      throw new ExternalServiceError('WordPress', 'Unknown error occurred');
    }
  }

  /**
   * Publish a blog post
   * @param postData - Blog post data
   * @returns WordPress post ID and URL
   */
  async publishPost(postData: WordPressPostData): Promise<WordPressResponse> {
    const startTime = Date.now();

    logDebug('Publishing post to WordPress', {
      siteUrl: this.siteUrl,
      title: postData.title,
      status: postData.status || 'draft',
    });

    try {
      // Prepare post data for WordPress API
      const wpPostData = {
        title: postData.title,
        content: postData.content,
        status: postData.status || 'draft',
        excerpt: postData.excerpt,
        categories: postData.categories,
        tags: postData.tags,
        featured_media: postData.featuredMedia,
      };

      // Create post
      const createdPost = await this.request<any>('posts', {
        method: 'POST',
        body: wpPostData,
      });

      const duration = Date.now() - startTime;
      logServiceCall('WordPress', 'publish post', duration, {
        postId: createdPost.id,
        siteUrl: this.siteUrl,
      });

      // Return formatted response
      return {
        id: createdPost.id,
        url: createdPost.link,
        title: createdPost.title.rendered,
        status: createdPost.status,
        date: createdPost.date,
        modified: createdPost.modified,
        link: createdPost.link,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
        logError('WordPress publish error', { error: error instanceof Error ? error.message : String(error), duration });
        throw error;
      }

      logError('Unknown WordPress publish error', { error, duration });
      throw new ExternalServiceError('WordPress', 'Failed to publish post');
    }
  }

  /**
   * Update an existing post
   * @param postId - WordPress post ID
   * @param postData - Updated post data
   * @returns Updated WordPress post
   */
  async updatePost(postId: number, postData: Partial<WordPressPostData>): Promise<WordPressResponse> {
    const startTime = Date.now();

    logDebug('Updating post in WordPress', {
      siteUrl: this.siteUrl,
      postId,
    });

    try {
      // Prepare update data
      const wpPostData: Record<string, unknown> = {};

      if (postData.title !== undefined) wpPostData.title = postData.title;
      if (postData.content !== undefined) wpPostData.content = postData.content;
      if (postData.status !== undefined) wpPostData.status = postData.status;
      if (postData.excerpt !== undefined) wpPostData.excerpt = postData.excerpt;
      if (postData.categories !== undefined) wpPostData.categories = postData.categories;
      if (postData.tags !== undefined) wpPostData.tags = postData.tags;
      if (postData.featuredMedia !== undefined) wpPostData.featured_media = postData.featuredMedia;

      // Update post
      const updatedPost = await this.request<any>(`posts/${postId}`, {
        method: 'PUT',
        body: wpPostData,
      });

      const duration = Date.now() - startTime;
      logServiceCall('WordPress', 'update post', duration, {
        postId,
        siteUrl: this.siteUrl,
      });

      return {
        id: updatedPost.id,
        url: updatedPost.link,
        title: updatedPost.title.rendered,
        status: updatedPost.status,
        date: updatedPost.date,
        modified: updatedPost.modified,
        link: updatedPost.link,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
        throw error;
      }

      logError('Unknown WordPress update error', { error, duration });
      throw new ExternalServiceError('WordPress', 'Failed to update post');
    }
  }

  /**
   * Delete a post (move to trash by default)
   * @param postId - WordPress post ID
   * @param force - Permanently delete if true
   */
  async deletePost(postId: number, force: boolean = false): Promise<void> {
    const startTime = Date.now();

    logDebug('Deleting post from WordPress', {
      siteUrl: this.siteUrl,
      postId,
      force,
    });

    try {
      await this.request(`posts/${postId}?force=${force}`, {
        method: 'DELETE',
      });

      const duration = Date.now() - startTime;
      logServiceCall('WordPress', 'delete post', duration, {
        postId,
        siteUrl: this.siteUrl,
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
        throw error;
      }

      logError('Unknown WordPress delete error', { error, duration });
      throw new ExternalServiceError('WordPress', 'Failed to delete post');
    }
  }

  /**
   * Upload a media file (featured image)
   * @param fileBuffer - File buffer
   * @param filename - File name
   * @param mimeType - MIME type
   * @returns WordPress media object
   */
  async uploadMedia(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    options: {
      altText?: string;
      caption?: string;
    } = {}
  ): Promise<WordPressMedia> {
    const startTime = Date.now();

    logDebug('Uploading media to WordPress', {
      siteUrl: this.siteUrl,
      filename,
      mimeType,
    });

    try {
      const url = `${this.siteUrl}/wp-json/wp/v2/media`;
      const formData = new FormData();

      // Create File-like object from buffer
      const uint8Array = new Uint8Array(fileBuffer);
      const blob = new Blob([uint8Array], { type: mimeType });
      const file = new File([blob], filename, { type: mimeType });
      formData.append('file', file);

      // Add metadata
      if (options.altText) {
        formData.append('alt_text', options.altText);
      }
      if (options.caption) {
        formData.append('caption', options.caption);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        throw new AuthenticationError('WordPress authentication failed');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new ExternalServiceError('WordPress', `Media upload error: ${response.status} - ${errorText}`);
      }

      const media = await response.json();

      const duration = Date.now() - startTime;
      logServiceCall('WordPress', 'upload media', duration, {
        mediaId: media.id,
        siteUrl: this.siteUrl,
      });

      return {
        id: media.id,
        url: media.source_url,
        caption: media.caption?.rendered,
        altText: media.alt_text,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
        throw error;
      }

      logError('Unknown WordPress media upload error', { error, duration });
      throw new ExternalServiceError('WordPress', 'Failed to upload media');
    }
  }

  /**
   * Get categories from WordPress
   */
  async getCategories(): Promise<WordPressCategory[]> {
    logDebug('Fetching categories from WordPress', { siteUrl: this.siteUrl });

    try {
      const categories = await this.request<any[]>('categories?per_page=100');

      return categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }));
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
        throw error;
      }

      logError('WordPress categories fetch error', { error });
      throw new ExternalServiceError('WordPress', 'Failed to fetch categories');
    }
  }

  /**
   * Get tags from WordPress
   */
  async getTags(): Promise<WordPressTag[]> {
    logDebug('Fetching tags from WordPress', { siteUrl: this.siteUrl });

    try {
      const tags = await this.request<any[]>('tags?per_page=100');

      return tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      }));
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ExternalServiceError) {
        throw error;
      }

      logError('WordPress tags fetch error', { error });
      throw new ExternalServiceError('WordPress', 'Failed to fetch tags');
    }
  }

  /**
   * Test connection to WordPress
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch user info to test authentication
      await this.request<any>('users/me');
      return true;
    } catch (error) {
      logError('WordPress connection test failed', { error });
      return false;
    }
  }
}

/**
 * Create WordPress client from config
 */
export function createWordPressClient(config: {
  siteUrl: string;
  username: string;
  appPassword: string;
}): WordPressClient {
  return new WordPressClient(config);
}

/**
 * Default export for easier imports
 */
export default WordPressClient;
