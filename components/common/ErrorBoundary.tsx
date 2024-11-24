'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error in onError callback:', callbackError);
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      try {
        console.group('Error Boundary Caught Error:');
        console.error('Error:', error?.message || error);
        if (errorInfo?.componentStack) {
          const stack = errorInfo.componentStack
            .split('\n')
            .filter(line => line.trim())
            .slice(0, 3)
            .join('\n');
          console.error('Component Stack (truncated):', stack);
        }
        console.groupEnd();
      } catch (loggingError) {
        // Fail silently if console logging fails
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-sm bg-red-900/50 p-4 rounded overflow-auto">
                <strong>Error:</strong> {this.state.error.message || 'An unknown error occurred'}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}