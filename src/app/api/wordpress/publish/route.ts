import { NextRequest } from 'next/server';
import { createdResponse, successResponse } from '@/utils/api-response';
import { ValidationError, NotFoundError, ExternalServiceError, AuthenticationError, handleApiError } from '@/utils/error-handler';
import { logInfo, logError } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { getWordPressClientForUser, publishBlogPostForUser } from '@/lib/wordpress-helper';
import type { WordPressPostData } from '@/types';
import { withAuth, requireResourceOwner } from '@/utils/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const { userId, error: authError } = await withAuth(request);

    if (authError || !userId) {
      return handleApiError(new Error(authError || 'Authentication required'));
    }

    const body = await request.json();
    const { blogId, wordpressConfig } = body;

    if (!blogId) {
      throw new ValidationError('Blog ID is required');
    }

    logInfo('Starting WordPress publish', { blogId, userId });

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogId },
      include: {
        videoJob: true,
      },
    });

    if (!blogPost) {
      throw new NotFoundError('BlogPost', blogId);
    }

    // Verify user owns this blog post
    requireResourceOwner(userId, blogPost.userId);

    if (blogPost.wordpressPostId) {
      return successResponse({
        blogId,
        wordpressPostId: parseInt(blogPost.wordpressPostId),
        message: 'Blog already published to WordPress',
      });
    }

    // Get WordPress config
    let wpConfig;
    if (wordpressConfig) {
      // Validate provided config
      const { siteUrl, username, appPassword } = wordpressConfig;
      if (!siteUrl || !username || !appPassword) {
        throw new ValidationError('WordPress config must include siteUrl, username, and appPassword');
      }
      wpConfig = wordpressConfig;
    } else {
      // Fetch from database
      const dbConfig = await prisma.wordPressConfig.findUnique({
        where: { userId },
      });

      if (!dbConfig) {
        throw new ValidationError('No WordPress configuration found. Please configure WordPress first.');
      }

      wpConfig = {
        siteUrl: dbConfig.siteUrl,
        username: dbConfig.username,
        appPassword: dbConfig.appPassword,
      };
    }

    logInfo('Publishing to WordPress', {
      blogId,
      siteUrl: wpConfig.siteUrl,
      title: blogPost.title,
    });

    const postData: WordPressPostData = {
      title: blogPost.title,
      content: blogPost.content,
      status: 'publish',
      excerpt: blogPost.content.substring(0, 200) + '...',
    };

    // Test WordPress connection first
    const wpClient = await getWordPressClientForUser(userId, wpConfig);
    if (!wpClient) {
      throw new AuthenticationError('Failed to connect to WordPress. Please check your credentials.');
    }

    const publishResult = await publishBlogPostForUser(userId, postData, wpConfig);

    if (!publishResult || !publishResult.id) {
      throw new ExternalServiceError('WORDPRESS', 'Failed to publish post');
    }

    logInfo('Published to WordPress successfully', {
      blogId,
      wordpressPostId: publishResult.id,
      url: publishResult.url,
    });

    // Update blog post with WordPress data
    const updatedBlogPost = await prisma.blogPost.update({
      where: { id: blogId },
      data: {
        wordpressPostId: publishResult.id.toString(),
        status: 'published',
      },
    });

    return createdResponse({
      blogId: updatedBlogPost.id,
      wordpressPostId: publishResult.id,
      wordpressUrl: publishResult.url,
      status: updatedBlogPost.status,
    }, 'Blog post published to WordPress successfully');

  } catch (error) {
    return handleApiError(error);
  }
}