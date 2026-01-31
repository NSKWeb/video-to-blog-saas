'use client';

/**
 * Sign Up Form Component
 * User registration with email, password, and name
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/utils/password';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';

export default function SignUpForm() {
  const router = useRouter();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; errors: string[] }>({
    score: 0,
    errors: [],
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Update password strength when password changes
    if (name === 'password') {
      const validation = validatePasswordStrength(value);
      setPasswordStrength({
        score: validation.score,
        errors: validation.errors,
      });
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Please enter your name';
    }

    // Password validation
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0] || 'Password is too weak';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await signup(formData.email, formData.password, formData.name.trim());

      setToast({ message: 'Account created successfully!', type: 'success' });

      // Redirect to home after successful signup
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      setErrors({ form: message });
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Dismiss toast
   */
  const dismissToast = () => {
    setToast(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errors.form}
          </div>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          autoComplete="email"
        />

        <Input
          label="Name"
          name="name"
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          autoComplete="name"
        />

        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={`text-${getPasswordStrengthColor(passwordStrength.score)}-600 font-medium`}>
                  {getPasswordStrengthLabel(passwordStrength.score)}
                </span>
                <span className="text-gray-500">
                  {passwordStrength.score}/4 requirements met
                </span>
              </div>

              {/* Strength Bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${getPasswordStrengthColor(passwordStrength.score)}-500 transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>

              {/* Requirements List */}
              {passwordStrength.errors.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-1 mt-2">
                  <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                    ✓ At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ At least 1 uppercase letter
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ At least 1 number
                  </li>
                  <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ At least 1 special character
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={dismissToast}
        />
      )}
    </>
  );
}
