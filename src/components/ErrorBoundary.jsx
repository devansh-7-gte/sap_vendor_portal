'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught unhandled lifecycle error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full flex items-center justify-center p-8 select-none">
          <div className="max-w-md w-full card p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-rose-900/20 rounded-none text-rose-400">
              <AlertTriangle className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-primary">
                Application View Error
              </h3>
              <p className="text-sm text-text-secondary leading-normal">
                An unexpected JavaScript error occurred while rendering this view.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full p-3 rounded-none bg-base text-left overflow-x-auto max-h-32 border border-border">
                <code className="text-[10px] font-mono text-rose-400 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <Button
              onClick={this.handleReset}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-3.5" />
              Reload Portal
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
