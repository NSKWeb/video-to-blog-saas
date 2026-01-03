'use client';

/**
 * Custom hook for polling job status with auto-retry
 * Stops polling when job completes or fails
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/utils/fetch-helper';
import type { JobStatusResponse } from '@/types/api';

interface UseJobStatusOptions {
  pollInterval?: number; // milliseconds between polls (default: 3000)
  maxRetries?: number; // max retry attempts (default: 10)
  enabled?: boolean; // whether to start polling automatically
}

export function useJobStatus(
  jobId: string | null,
  options: UseJobStatusOptions = {}
) {
  const {
    pollInterval = 3000,
    maxRetries = 10,
    enabled = true,
  } = options;

  const [data, setData] = useState<JobStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch job status
  const fetchStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const response = await api.get<JobStatusResponse>(`/api/jobs/${jobId}`);
      
      if (isMountedRef.current) {
        setData(response);
        setError(null);
        
        // Stop polling if job is completed or failed
        const isTerminalState = 
          response.job.status === 'completed' || 
          response.job.status === 'failed';
        
        if (isTerminalState) {
          stopPolling();
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job status';
        setError(errorMessage);
        setRetryCount(prev => {
          const newCount = prev + 1;
          
          // Stop if max retries reached
          if (newCount >= maxRetries) {
            stopPolling();
          }
          
          return newCount;
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [jobId, maxRetries]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setIsPolling(true);
    setRetryCount(0);
    
    // Fetch immediately
    fetchStatus();
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchStatus();
    }, pollInterval);
  }, [pollInterval, fetchStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Manual refetch
  const refetch = useCallback(() => {
    return fetchStatus();
  }, [fetchStatus]);

  // Start polling when jobId changes and enabled is true
  useEffect(() => {
    if (jobId && enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [jobId, enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Determine current processing step
  const currentStep = data?.job.status === 'pending' ? 'fetching' 
    : data?.job.status === 'processing' 
      ? data?.job.transcription && !data?.blogPost ? 'transcribing'
      : data?.blogPost ? 'generating'
      : 'fetching'
    : data?.job.status === 'completed' ? 'completed'
    : 'fetching';

  return {
    data,
    loading,
    error,
    isPolling,
    retryCount,
    currentStep,
    fetchStatus,
    refetch,
    startPolling,
    stopPolling,
  };
}
