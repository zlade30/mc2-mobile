import * as Sentry from "@sentry/react-native";
import React, { type ErrorInfo, type ReactNode } from "react";

import { ErrorScreen } from "@/shared/ui/error-screen";

type ErrorBoundaryState = {
  error: Error | null;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    if (__DEV__) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorScreen error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
