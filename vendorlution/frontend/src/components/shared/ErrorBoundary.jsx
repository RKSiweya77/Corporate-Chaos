// src/components/shared/ErrorBoundary.jsx
import React from 'react';
import { errorLogger } from '../../utils/errors';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo: errorInfo
    });
    
    // Log error to our error service
    errorLogger.capture(error, { 
      componentStack: errorInfo.componentStack 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center">
            <div className="display-1 text-muted mb-4">⚠️</div>
            <h1 className="h2 mb-3">Something went wrong</h1>
            <p className="text-muted mb-4">
              We're sorry, but something went wrong. Please try refreshing the page.
            </p>
            <button 
              className="btn btn-primary me-2"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              Try Again
            </button>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 p-3 bg-dark text-light rounded text-start">
                <details>
                  <summary>Error Details (Development)</summary>
                  <pre className="mt-2 small">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;