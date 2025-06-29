'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials, RegisterData } from '@/types';
import { storage } from '@/lib/utils';
import { STORAGE_KEYS, MOCKUP_USERS } from '@/lib/constants';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = storage.get<User>(STORAGE_KEYS.USER);
    
    if (storedUser) {
      setAuthState({
        user: storedUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check against mockup accounts
      const account = MOCKUP_USERS.find(
        acc => acc.email === credentials.email && acc.password === credentials.password
      );

      if (account) {
        const user: User = {
          email: account.email,
          name: account.name,
          role: account.role,
          status: 'online',
        };

        // Store user data
        storage.set(STORAGE_KEYS.USER, user);
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: 'Invalid email or password' 
        };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: 'An error occurred during login' 
      };
    }
  }, []);

  // Register function (for future implementation)
  const register = useCallback(async (data: RegisterData): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // TODO: Implement actual registration logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just return success
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: 'Registration failed' 
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    router.push('/login');
  }, [router]);

  // Update user profile
  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };
    storage.set(STORAGE_KEYS.USER, updatedUser);
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  }, [authState.user]);

  // Check if user has specific role
  const hasRole = useCallback((role: User['role']): boolean => {
    return authState.user?.role === role;
  }, [authState.user]);

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
  };
}