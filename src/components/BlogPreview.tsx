'use client';

/**
 * Blog preview component
 * Displays the generated blog post with metadata and formatting
 */

import { useState } from 'react';
import { Button } from './Button';
import type { BlogPostResponse } from '@/types/api';

interface BlogPreviewProps {
  blogPost: BlogPostResponse | null;
  loading?: boolean;
}

export function BlogPreview({ blogPost, loading }: BlogPreviewProps) {
  const [copied, setCopied] = useState(false);

  // Calculate reading time (average 200 words per minute)
  const readingTime = blogPost ? Math.ceil(blogPost.wordCount / 200) : 0;

  const handleCopyContent = async () => {
    if (!blogPost) return;

    try {
      await navigator.clipboard.writeText(blogPost.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Blog Preview
        </h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600">
            Your blog post will appear here once it&apos;s generated.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This usually takes a few minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Blog Preview
          </h3>
          {blogPost.status === 'published' && (
            <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Published to WordPress
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyContent}
        >
          {copied ? '✓ Copied!' : 'Copy Content'}
        </Button>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span>{blogPost.wordCount} words</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{readingTime} min read</span>
        </div>
      </div>

      {/* Blog Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {blogPost.title}
      </h1>

      {/* AdSense Placement: Top Banner */}
      {/* AdSense Placement: In-article Ad (Rectangle 300x250) - Can be placed after title */}
      <div className="mb-6 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center text-sm text-gray-500">
        {/* AdSense Top Banner Ad Placeholder */}
        &lt;!-- AdSense Top Banner Ad Placement --&gt;
      </div>

      {/* Blog Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: blogPost.content }}
      />

      {/* AdSense Placement: In-article Ad */}
      {/* AdSense Placement: In-article Ad (Rectangle 300x250) - Can be placed mid-content */}
      <div className="my-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center text-sm text-gray-500">
        {/* AdSense In-Article Ad Placeholder */}
        &lt;!-- AdSense In-Article Ad Placement --&gt;
      </div>

      {/* AdSense Placement: Bottom Banner */}
      {/* AdSense Placement: Bottom Rectangle Ad (300x250) */}
      <div className="mt-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center text-sm text-gray-500">
        {/* AdSense Bottom Banner Ad Placeholder */}
        &lt;!-- AdSense Bottom Banner Ad Placement --&gt;
      </div>
    </div>
  );
}
