import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-md text-center">
            <h1 className="font-display text-display-lg font-semibold text-ink mb-4">Something went wrong</h1>
            <p className="font-body text-body text-secondary mb-6">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <pre className="font-body text-sm bg-gray-100 p-4 rounded-xl text-left overflow-auto max-h-40 mb-6">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 bg-primary text-white rounded-pill font-body text-body hover:bg-primary-focus transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
