/**
 * Password hashing and validation utilities
 * Uses bcrypt for secure password hashing
 */

import bcrypt from 'bcryptjs';
import { logError, logDebug } from './logger';

/**
 * Password strength requirements
 */
export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0-4
  errors: string[];
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  try {
    logDebug('Hashing password');
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    logError('Failed to hash password', { error });
    throw new Error('Password hashing failed');
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param plainText - Plain text password
 * @param hashed - Hashed password
 * @returns True if passwords match
 */
export async function comparePassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  try {
    logDebug('Comparing password');
    const match = await bcrypt.compare(plainText, hashed);
    return match;
  } catch (error) {
    logError('Failed to compare password', { error });
    throw new Error('Password comparison failed');
  }
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 * @param password - Password to validate
 * @returns Validation result with score and errors
 */
export function validatePasswordStrength(
  password: string
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Check minimum length (8 characters)
  if (password.length >= 8) {
    score++;
  } else {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for at least 1 uppercase letter
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  // Check for at least 1 number
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    errors.push('Password must contain at least 1 number');
  }

  // Check for at least 1 special character
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    errors.push('Password must contain at least 1 special character');
  }

  const valid = score === 4;

  logDebug('Password validation', { score, valid, errorCount: errors.length });

  return { valid, score, errors };
}

/**
 * Get password strength label based on score
 * @param score - Password strength score (0-4)
 * @returns Strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
    case 3:
      return 'Medium';
    case 4:
      return 'Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Get password strength color based on score
 * @param score - Password strength score (0-4)
 * @returns Tailwind color class
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'red';
    case 2:
    case 3:
      return 'yellow';
    case 4:
      return 'green';
    default:
      return 'gray';
  }
}
