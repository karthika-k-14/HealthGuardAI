import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Route-level Error Boundary
 * Catches render/runtime exceptions inside any page and shows a
 * graceful fallback UI instead of a blank white screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log for debugging without crashing further
    console.error('[ErrorBoundary] Caught error:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-signal-rose/10 text-signal-rose">
          <AlertTriangle className="h-8 w-8" />
        </span>

        <div className="max-w-md space-y-2">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This page encountered an unexpected error. Your data is safe — try
            refreshing or navigate to another section.
          </p>
          {isDev && this.state.error && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-rose-600 dark:bg-white/5 dark:text-rose-400">
              {this.state.error.message}
            </pre>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Home className="h-4 w-4" /> Go to Home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
