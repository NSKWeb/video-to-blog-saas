/**
 * Authentication types
 * Defines all auth-related request and response types
 */

/**
 * JWT payload
 */
export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  token: string;
  user: UserResponse;
  expiresIn: string;
}

/**
 * User response (excludes sensitive data)
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sign up request
 */
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0-4
  errors: string[];
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  expired: boolean;
  userId?: string;
  error?: string;
}

/**
 * Auth context interface
 */
export interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Auth state
 */
export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
