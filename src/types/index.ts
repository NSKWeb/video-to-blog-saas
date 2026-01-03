export type VideoJobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type BlogPostStatus = 'draft' | 'published' | 'failed';

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
