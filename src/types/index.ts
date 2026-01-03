/**
 * Status types for video jobs and blog posts
 */
export type VideoJobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type BlogPostStatus = 'draft' | 'published' | 'failed';

/**
 * API request types
 */
export interface CreateVideoJobRequest {
  videoUrl: string;
}

export interface CreateBlogPostRequest {
  videoJobId: string;
  title: string;
  content: string;
}

export interface WordPressConfigRequest {
  siteUrl: string;
  username: string;
  appPassword: string;
}

/**
 * Blog post types
 */
export interface BlogPost {
  id: string;
  videoJobId: string;
  title: string;
  content: string;
  wordCount: number;
  status: BlogPostStatus;
  wordpressPostId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostWithVideoJob extends BlogPost {
  videoJob: {
    id: string;
    videoUrl: string;
    status: VideoJobStatus;
  };
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * Transcript types
 */
export interface Transcript {
  text: string;
  language: string;
  confidence: number;
  duration?: number;
  words?: TranscriptWord[];
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

/**
 * Video job types
 */
export interface VideoJob {
  id: string;
  userId: string;
  videoUrl: string;
  status: VideoJobStatus;
  transcription?: string | null;
  blogPost?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoJobWithBlogPost extends VideoJob {
  blogPosts: BlogPost[];
}

/**
 * WordPress types
 */
export interface WordPressConfig {
  id: string;
  userId: string;
  siteUrl: string;
  username: string;
  appPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WordPressPostData {
  title: string;
  content: string;
  status?: 'draft' | 'publish' | 'private' | 'pending';
  excerpt?: string;
  categories?: number[];
  tags?: number[];
  featuredMedia?: number;
}

export interface WordPressResponse {
  id: number;
  url: string;
  title: string;
  status: string;
  date: string;
  modified: string;
  link: string;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressMedia {
  id: number;
  url: string;
  caption?: string;
  altText?: string;
}

/**
 * OpenAI types
 */
export interface OpenAIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface OpenAIChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finishReason: string;
}

export interface OpenAIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: OpenAIUsage;
}

export interface GeneratedBlogPost {
  title: string;
  content: string;
  excerpt?: string;
  seoMetadata: SEOMetadata;
  wordCount: number;
}

/**
 * Deepgram types
 */
export interface DeepgramWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
  speaker?: string;
}

export interface DeepgramAlternative {
  transcript: string;
  confidence: number;
  words?: DeepgramWord[];
}

export interface DeepgramChannel {
  alternatives: DeepgramAlternative[];
}

export interface DeepgramMetadata {
  transaction_key: string;
  request_id: string;
  sha256: string;
  created: string;
  duration: number;
  channels: number;
}

export interface DeepgramResults {
  channels: DeepgramChannel[];
  duration?: number;
}

export interface DeepgramResponse {
  metadata: DeepgramMetadata;
  results: DeepgramResults;
}

/**
 * Video fetcher types
 */
export interface VideoFetchOptions {
  maxSize?: number;
  timeout?: number;
  allowedFormats?: string[];
}

export interface AudioExtractionOptions {
  outputFormat?: 'mp3' | 'wav';
  quality?: number;
}

export interface FetchedVideoInfo {
  url: string;
  duration?: number;
  format: string;
  size: number;
  audioPath: string;
}

/**
 * API response types
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Error types
 */
export interface ApiErrorDetails {
  code?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}
