'use client'

export type Environment = 'production' | 'staging' | 'development';

export const getCurrentEnvironment = (): Environment => {
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }

  if (typeof window !== 'undefined') {
    return window.location.pathname.includes('/staging') ? 'staging' : 'production';
  }

  return 'production';
};
