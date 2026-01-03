'use client';

/**
 * Processing status component with visual step indicators
 * Shows real-time progress through the video-to-blog workflow
 */

import type { ProcessingStep, ProcessingStepInfo } from '@/types/api';
import { Spinner } from './Spinner';

interface ProcessingStatusProps {
  currentStep: ProcessingStep;
  error?: string | null;
}

const STEPS: Array<{ key: ProcessingStep; label: string; icon: string }> = [
  { key: 'fetching', label: 'Fetching Video', icon: '📥' },
  { key: 'transcribing', label: 'Transcribing Audio', icon: '🎤' },
  { key: 'generating', label: 'Generating Blog', icon: '✍️' },
  { key: 'publishing', label: 'Publishing to WordPress', icon: '🚀' },
  { key: 'completed', label: 'Completed', icon: '✅' },
];

export function ProcessingStatus({ currentStep, error }: ProcessingStatusProps) {
  const getStepStatus = (stepKey: ProcessingStep): 'pending' | 'active' | 'completed' | 'failed' => {
    // If there's an error and this is the current step, mark as failed
    if (error && stepKey === currentStep) {
      return 'failed';
    }

    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    const stepIndex = STEPS.findIndex(s => s.key === stepKey);

    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  const statusStyles = {
    pending: 'bg-gray-200 border-gray-300 text-gray-500',
    active: 'bg-blue-50 border-blue-300 text-blue-700',
    completed: 'bg-green-50 border-green-300 text-green-700',
    failed: 'bg-red-50 border-red-300 text-red-700',
  };

  const iconStyles = {
    pending: 'text-gray-400',
    active: 'text-blue-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">
        Processing Status
      </h3>

      <div className="space-y-4">
        {STEPS.map((step) => {
          const status = getStepStatus(step.key);
          const isCurrentStep = step.key === currentStep;
          const isCompleted = status === 'completed';
          const isFailed = status === 'failed';

          return (
            <div
              key={step.key}
              className={`
                flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                ${statusStyles[status]}
              `}
              role="listitem"
              aria-label={`${step.label} - ${status}`}
            >
              {/* Icon or Status Indicator */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                {isFailed ? (
                  <span className={iconStyles.failed}>❌</span>
                ) : isCompleted ? (
                  <span className={iconStyles.completed}>✓</span>
                ) : isCurrentStep ? (
                  <Spinner size="sm" color="blue" />
                ) : (
                  <span className="text-2xl">{step.icon}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{step.label}</p>
                  {isCurrentStep && !isFailed && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                  {isFailed && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Failed
                    </span>
                  )}
                </div>
                {isCurrentStep && !isFailed && (
                  <p className="text-sm opacity-75 mt-1">
                    Please wait...
                  </p>
                )}
              </div>

              {/* Connecting Line (except for last step) */}
              {step.key !== 'completed' && (
                <div className="hidden sm:block ml-4">
                  <div
                    className={`
                      w-1 h-8 rounded
                      ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <h4 className="font-medium text-red-800">Processing Failed</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {currentStep === 'completed' && !error && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-2xl">🎉</span>
            <div>
              <h4 className="font-medium text-green-800">
                Processing Complete!
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Your blog post is ready. Review it in the preview section below
                and publish to WordPress when you&apos;re satisfied.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
