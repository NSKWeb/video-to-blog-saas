'use client';

/**
 * Video input form component
 * Handles video URL submission with validation and error handling
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { Input } from './Input';
import { api, ApiError } from '@/utils/fetch-helper';
import { Toast, ToastType } from './Toast';

export function VideoInputForm() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError(null);

    // Validate URL
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    if (!isValidUrl(videoUrl)) {
      setError('Please enter a valid URL (e.g., https://youtube.com/watch?v=...)');
      return;
    }

    // Character limit validation
    if (videoUrl.length > 500) {
      setError('URL is too long. Maximum 500 characters allowed.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<{ id: string }>('/api/videos/process', {
        videoUrl: videoUrl.trim(),
      });

      // Success: Show toast and redirect
      setToast({
        message: 'Video submitted successfully! Processing started.',
        type: 'success',
      });

      // Clear form
      setVideoUrl('');

      // Redirect to job details page
      setTimeout(() => {
        router.push(`/jobs/${response.id}`);
      }, 1000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to process video');
        setToast({
          message: err.message || 'Failed to process video',
          type: 'error',
        });
      } else {
        setError('An unexpected error occurred');
        setToast({
          message: 'An unexpected error occurred',
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            id="video-url"
            type="url"
            label="Video URL"
            placeholder="Paste your video URL (YouTube, Vimeo, etc.)"
            value={videoUrl}
            onChange={handleInputChange}
            error={error || undefined}
            helpText="Supported platforms: YouTube, Vimeo, and other direct video URLs"
            fullWidth
            disabled={loading}
            maxLength={500}
            autoComplete="off"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!videoUrl.trim()}
          fullWidth
        >
          {loading ? 'Processing...' : 'Convert to Blog'}
        </Button>

        <div className="text-sm text-gray-500 text-center">
          <p className="mb-2">
            <span className="inline-flex items-center gap-1">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Processing typically takes 2-5 minutes depending on video length
            </span>
          </p>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
