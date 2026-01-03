/**
 * API response types for frontend-backend communication
 */

import {
  VideoJobStatus,
  BlogPostStatus,
  VideoJob,
  BlogPost,
  WordPressConfig,
  SEOMetadata,
} from './index';

/**
 * Video job responses
 */
export interface VideoJobResponse {
  id: string;
  userId: string;
  videoUrl: string;
  status: VideoJobStatus;
  transcription?: string | null;
  blogPost?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoJobDetailResponse extends VideoJobResponse {
  blogPosts?: BlogPost[];
  wordpressPublished?: boolean;
  wordpressPostId?: string | null;
  wordpressPostUrl?: string | null;
}

/**
 * Blog post responses
 */
export interface BlogPostResponse {
  id: string;
  videoJobId: string;
  title: string;
  content: string;
  wordCount: number;
  status: BlogPostStatus;
  wordpressPostId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedBlogPostResponse {
  id: string;
  videoJobId: string;
  title: string;
  content: string;
  wordCount: number;
  excerpt?: string;
  seoMetadata: SEOMetadata;
  createdAt: string;
}

/**
 * WordPress config responses
 */
export interface WordPressConfigResponse {
  id: string;
  userId: string;
  siteUrl: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface WordPressPublishResponse {
  id: number;
  url: string;
  title: string;
  status: string;
  link: string;
  date: string;
}

/**
 * Complete job status response
 */
export interface JobStatusResponse {
  job: VideoJobDetailResponse;
  blogPost?: BlogPostResponse;
  wordpressConfig?: WordPressConfigResponse;
  wordpressPost?: WordPressPublishResponse;
}

/**
 * Processing step types
 */
export type ProcessingStep = 
  | 'fetching'
  | 'transcribing'
  | 'generating'
  | 'publishing'
  | 'completed';

export interface ProcessingStepInfo {
  step: ProcessingStep;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  error?: string;
}

/**
 * Common API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
}
