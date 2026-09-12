'use client';

import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ThreeJS Render Error handled gracefully:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e] via-[#080808] to-[#080808] opacity-80" />
      );
    }
    return this.props.children;
  }
}

export default function SceneWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ThreeErrorBoundary fallback={fallback}>
      <Suspense
        fallback={
          fallback || (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e] via-[#080808] to-[#080808] opacity-80" />
          )
        }
      >
        {children}
      </Suspense>
    </ThreeErrorBoundary>
  );
}
