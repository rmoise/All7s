'use client'

export type Environment = 'production' | 'staging' | 'development';

export const getCurrentEnvironment = (): Environment => {
  try {
    // For client-side, check hostname first
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('Environment detected (hostname):', 'development');
        return 'development';
      }
    }

    // Then check explicit environment variable
    const envVar = process.env.NEXT_PUBLIC_ENVIRONMENT;
    if (envVar) {
      console.log('Environment detected (env var):', envVar);
      return envVar as Environment;
    }

    // Finally fallback to NODE_ENV
    const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    console.log('Environment detected (NODE_ENV):', nodeEnv);
    return nodeEnv;
  } catch (error) {
    console.warn('Error detecting environment:', error);
    return 'development'; // Safe fallback
  }
};
