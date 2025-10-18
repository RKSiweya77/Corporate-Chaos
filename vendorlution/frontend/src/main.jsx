// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Global styles
import './styles/global.css';
import './styles/components.css';
import './styles/theme.css';
import './styles/responsive.css';

// Error boundary for production
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
    console.error('Application error:', error, errorInfo);
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
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-primary"
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
            </div>
            
            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 p-3 bg-dark text-light rounded text-start small">
                <details>
                  <summary>Error Details (Development)</summary>
                  <pre className="mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
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

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);