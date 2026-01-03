'use client';

/**
 * Toast notification component
 * Shows success, error, and info messages with auto-dismiss
 */

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // milliseconds (default: 4000)
  onClose?: () => void;
}

export function Toast({ 
  message, 
  type = 'info', 
  duration = 4000,
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '✓',
      iconBg: 'bg-green-500',
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '✕',
      iconBg: 'bg-red-500',
      text: 'text-red-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'i',
      iconBg: 'bg-blue-500',
      text: 'text-blue-800',
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`
        fixed top-4 right-4 max-w-md w-full p-4 rounded-lg shadow-lg
        ${styles.bg} ${styles.border} border-2
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        z-50
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={`${styles.iconBg} text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold`}
        >
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${styles.text} font-medium`}>{message}</p>
        </div>
        <button
          onClick={handleClose}
          className={`
            ${styles.text} hover:opacity-75 transition-opacity
            flex-shrink-0 p-1
          `}
          aria-label="Close notification"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
