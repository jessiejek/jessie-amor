import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="ja-error-boundary">
        <div className="ja-error-boundary-card">
          <div className="ja-error-boundary-emoji">😿</div>
          <h1 className="ja-error-boundary-title">Something went wrong</h1>
          <p className="ja-error-boundary-text">
            The app hit an unexpected error. Your saved data is safe on this device — reloading
            usually fixes it.
          </p>
          {this.state.error?.message ? (
            <pre className="ja-error-boundary-detail">{this.state.error.message}</pre>
          ) : null}
          <button type="button" className="ja-error-boundary-btn" onClick={this.handleReload}>
            Reload app
          </button>
        </div>
      </div>
    );
  }
}
