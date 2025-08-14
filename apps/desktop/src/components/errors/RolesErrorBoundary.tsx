import React, { Component, ErrorInfo, ReactNode } from "react";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "RolesErrorBoundary", level: "error" },
});

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RolesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("Roles error boundary caught error", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error.message}
            </p>
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
