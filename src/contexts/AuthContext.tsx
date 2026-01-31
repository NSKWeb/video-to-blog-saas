'use client';

/**
 * Authentication Context
 * Provides global authentication state and methods
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/utils/fetch-helper';
import { getToken, setToken, removeToken, isTokenValid } from '@/utils/token';
import { AuthContextValue, AuthState, UserResponse, AuthResponse } from '@/types/auth';

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Initial auth state
 */
const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  /**
   * Fetch current user data from API
   */
  const fetchCurrentUser = useCallback(async (): Promise<UserResponse | null> => {
    try {
      const response = await api.get<{ data: UserResponse }>(
        '/api/auth/me',
        { includeAuth: true }
      );
      return response.data;
    } catch (error) {
      // User might be logged out or token expired
      if (error instanceof ApiError && error.statusCode === 401) {
        return null;
      }
      throw error;
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getToken();

        if (token && isTokenValid()) {
          const user = await fetchCurrentUser();
          if (user) {
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              loading: false,
            });
          } else {
            // Token invalid or user not found
            removeToken();
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        } else {
          // No valid token
          removeToken();
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        removeToken();
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initializeAuth();
  }, [fetchCurrentUser]);

  /**
   * Login user
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.post<{ data: AuthResponse }>(
        '/api/auth/login',
        { email, password }
      );

      const { token, user } = response.data;

      setToken(token);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed');
    }
  }, []);

  /**
   * Sign up user
   */
  const signup = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<void> => {
    try {
      const response = await api.post<{ data: AuthResponse }>(
        '/api/auth/signup',
        { email, password, name }
      );

      const { token, user } = response.data;

      setToken(token);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Sign up failed');
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout endpoint (optional, can inform server)
      await api.post<{ data: { message: string } }>(
        '/api/auth/logout',
        {},
        { includeAuth: true }
      );
    } catch (error) {
      // Ignore logout endpoint errors
      console.error('Logout endpoint error:', error);
    } finally {
      // Always clear local auth state
      removeToken();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const token = getToken();

      if (!token || !isTokenValid()) {
        await logout();
        return;
      }

      const user = await fetchCurrentUser();

      if (user) {
        setAuthState((prev) => ({
          ...prev,
          user,
          isAuthenticated: true,
          loading: false,
        }));
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  }, [fetchCurrentUser, logout]);

  /**
   * Auth context value
   */
  const value: AuthContextValue = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Access auth context and methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login('email', 'password')}>Login</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.email}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
