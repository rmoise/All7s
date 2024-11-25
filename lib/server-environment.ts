export type Environment = 'production' | 'staging' | 'development';

export const getServerEnvironment = (): Environment => {
  // For server-side, prioritize explicit environment variables
  const envVar = process.env.NODE_ENV;

  if (envVar === 'production') {
    return 'production';
  }

  return 'development';
};
