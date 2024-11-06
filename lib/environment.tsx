'use client'

export type Environment = 'production' | 'staging' | 'development';

export const getEnvironment = (): Environment => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.includes('/staging')) {
      return 'staging';
    }
    if (pathname.includes('/production') || window.location.hostname === 'all7z.sanity.studio') {
      return 'production';
    }
  }

  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return 'production';
  }
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
    return 'staging';
  }
  return 'development';
};
