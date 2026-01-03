'use client';

/**
 * WordPress publishing panel component
 * Shows WordPress configuration and allows publishing the blog post
 */

import { useState } from 'react';
import { Button } from './Button';
import { Modal, ModalActions } from './Modal';
import { api } from '@/utils/fetch-helper';
import type { WordPressConfigResponse, WordPressPublishResponse, BlogPostResponse } from '@/types/api';

interface WordPressPublishPanelProps {
  blogPost: BlogPostResponse | null;
  wordpressConfig: WordPressConfigResponse | null;
  onConfigUpdate?: () => void;
  onPublishSuccess?: (response: WordPressPublishResponse) => void;
}

export function WordPressPublishPanel({
  blogPost,
  wordpressConfig,
  onConfigUpdate,
  onPublishSuccess,
}: WordPressPublishPanelProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedPost, setPublishedPost] = useState<WordPressPublishResponse | null>(null);

  const handlePublish = async () => {
    if (!blogPost || !wordpressConfig) return;

    setIsPublishing(true);
    setPublishError(null);

    try {
      const response = await api.post<WordPressPublishResponse>('/api/wordpress/publish', {
        blogPostId: blogPost.id,
      });

      setPublishedPost(response);
      setShowConfirmModal(false);
      onPublishSuccess?.(response);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to publish to WordPress');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenConfigModal = () => {
    setShowConfigModal(true);
    setShowConfirmModal(false);
  };

  const handleConfigComplete = () => {
    setShowConfigModal(false);
    onConfigUpdate?.();
  };

  const copyPostUrl = () => {
    if (publishedPost?.link) {
      navigator.clipboard.writeText(publishedPost.link);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Publish to WordPress
        </h3>

        {/* WordPress Configuration Status */}
        {!wordpressConfig ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-800">
                    WordPress Not Configured
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Configure your WordPress site to publish blog posts directly.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleOpenConfigModal}
            >
              Configure WordPress
            </Button>

            <div className="text-sm text-gray-500 text-center">
              <p>
                Need help?{' '}
                <a
                  href="https://wordpress.org/support/article/application-passwords/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  How to generate an app password
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Configured Site Info */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                WordPress Configured
              </div>
              <p className="text-sm text-green-700 break-all">
                <span className="font-medium">Site:</span> {wordpressConfig.siteUrl}
              </p>
              <p className="text-sm text-green-700">
                <span className="font-medium">Username:</span> {wordpressConfig.username}
              </p>
            </div>

            {/* Publish Button */}
            {blogPost && !publishedPost && !blogPost.wordpressPostId ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowConfirmModal(true)}
                disabled={blogPost.status === 'published'}
              >
                {blogPost.status === 'published' ? 'Already Published' : 'Publish to WordPress'}
              </Button>
            ) : null}

            {/* Publishing Error */}
            {publishError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{publishError}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => setPublishError(null)}
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Published Success */}
            {(publishedPost || blogPost?.wordpressPostId) ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Published Successfully!
                </div>
                <a
                  href={publishedPost?.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-700 hover:underline break-all block mb-2"
                >
                  {publishedPost?.link || 'View post'}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPostUrl}
                >
                  Copy URL
                </Button>
              </div>
            ) : null}

            {/* Configure Button */}
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={handleOpenConfigModal}
              >
                Edit Configuration
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <WordPressConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          existingConfig={wordpressConfig}
          onComplete={handleConfigComplete}
        />
      )}

      {/* Confirm Publish Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Publication"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to publish this blog post to your WordPress site?
            </p>
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium text-gray-900">{blogPost?.title}</p>
              <p className="text-gray-600 mt-1">
                {blogPost?.wordCount} words • {Math.ceil(blogPost.wordCount / 200)} min read
              </p>
            </div>
          </div>

          <ModalActions className="mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              loading={isPublishing}
            >
              Publish
            </Button>
          </ModalActions>
        </Modal>
      )}
    </>
  );
}

// WordPress Config Modal Component
interface WordPressConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingConfig?: WordPressConfigResponse | null;
  onComplete?: () => void;
}

function WordPressConfigModal({
  isOpen,
  onClose,
  existingConfig,
  onComplete,
}: WordPressConfigModalProps) {
  const [siteUrl, setSiteUrl] = useState(existingConfig?.siteUrl || '');
  const [username, setUsername] = useState(existingConfig?.username || '');
  const [appPassword, setAppPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const validateForm = () => {
    if (!siteUrl.trim()) {
      setError('Site URL is required');
      return false;
    }

    try {
      const url = new URL(siteUrl.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        setError('Site URL must start with http:// or https://');
        return false;
      }
    } catch {
      setError('Please enter a valid URL');
      return false;
    }

    if (!username.trim()) {
      setError('Username is required');
      return false;
    }

    if (!existingConfig && !appPassword.trim()) {
      setError('App Password is required for new configurations');
      return false;
    }

    return true;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      await api.post('/api/wordpress/config', {
        siteUrl: siteUrl.trim(),
        username: username.trim(),
        appPassword: appPassword.trim(),
      });

      setTestResult({ success: true, message: 'Connection successful!' });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      await api.post('/api/wordpress/config', {
        siteUrl: siteUrl.trim(),
        username: username.trim(),
        appPassword: appPassword.trim(),
      });

      onClose();
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingConfig ? 'Edit WordPress Configuration' : 'Configure WordPress'}
      size="md"
    >
      <div className="space-y-4">
        {/* Site URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WordPress Site URL
          </label>
          <input
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://myblog.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your WordPress site URL (e.g., https://myblog.com)
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WordPress Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your WordPress admin username
          </p>
        </div>

        {/* App Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Application Password {existingConfig && '(leave empty to keep existing)'}
          </label>
          <input
            type="password"
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            placeholder={existingConfig ? '••••••••' : 'Enter app password'}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Generate an app password in WordPress → Users → Profile
          </p>
        </div>

        {/* Test Connection Button */}
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestConnection}
            loading={isTesting}
            disabled={!siteUrl || !username || (!existingConfig && !appPassword)}
          >
            Test Connection
          </Button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3 rounded-lg ${
              testResult.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Help Links */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Need help generating an app password?
          </p>
          <a
            href="https://wordpress.org/support/article/application-passwords/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            View WordPress documentation →
          </a>
        </div>
      </div>

      <ModalActions className="mt-6">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={isSaving}
        >
          Save Configuration
        </Button>
      </ModalActions>
    </Modal>
  );
}
