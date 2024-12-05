'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class PreviewErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Preview error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
    this.setState({
      error,
      errorInfo
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white space-y-4 max-w-2xl p-6">
            <h2 className="text-xl font-bold">Preview Error</h2>
            <p className="text-red-400">{this.state.error?.message}</p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="text-xs bg-gray-900 p-4 rounded overflow-auto max-h-[200px]">
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
            <button
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
              onClick={() => window.location.reload()}
            >
              Retry Preview
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}