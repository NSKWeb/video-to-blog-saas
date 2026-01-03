'use client';

/**
 * Job details page
 * Shows processing status, blog preview, and WordPress publishing panel
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { BlogPreview } from '@/components/BlogPreview';
import { WordPressPublishPanel } from '@/components/WordPressPublishPanel';
import { api, ApiError } from '@/utils/fetch-helper';
import { useJobStatus } from '@/hooks/useJobStatus';
import type { JobStatusResponse } from '@/types/api';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params.jobId === 'string' ? params.jobId : params.jobId?.[0];
  
  const { data, error, loading, currentStep, refetch, stopPolling } = useJobStatus(jobId || null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Handle publish success
  const handlePublishSuccess = () => {
    setPublishSuccess(true);
    stopPolling();
    // Refetch to get updated data
    refetch();
  };

  // Handle back to home
  const handleBack = () => {
    router.push('/');
  };

  // Copy job URL
  const copyJobUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  if (!jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid job ID</p>
          <button
            onClick={handleBack}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Job Details
                </h1>
                <p className="text-sm text-gray-500">
                  {data?.job.videoUrl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyJobUrl}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Copy job URL"
              >
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Share
              </button>
              {publishSuccess && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                  ✓ Published
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Processing Status */}
          <div className="lg:col-span-1">
            <ProcessingStatus
              currentStep={currentStep as any}
              error={data?.job.status === 'failed' ? 'Job failed. Please try again.' : null}
            />
          </div>

          {/* Middle Column - Blog Preview */}
          <div className="lg:col-span-2">
            <BlogPreview
              blogPost={data?.blogPost || null}
              loading={loading}
            />
          </div>

          {/* Bottom Row - WordPress Panel (on mobile) */}
          <div className="lg:hidden mt-6">
            <WordPressPublishPanel
              blogPost={data?.blogPost || null}
              wordpressConfig={data?.wordpressConfig || null}
              onPublishSuccess={handlePublishSuccess}
              onConfigUpdate={refetch}
            />
          </div>
        </div>

        {/* Right Side Column - WordPress Panel (on desktop) */}
        <div className="hidden lg:block mt-6">
          <div className="max-w-md">
            <WordPressPublishPanel
              blogPost={data?.blogPost || null}
              wordpressConfig={data?.wordpressConfig || null}
              onPublishSuccess={handlePublishSuccess}
              onConfigUpdate={refetch}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
