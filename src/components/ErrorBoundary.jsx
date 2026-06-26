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
          <div className="max-w-md w-full border border-stone-200 dark:border-stone-850 rounded-lg p-6 bg-white dark:bg-stone-900 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-full text-red-650 dark:text-red-400">
              <AlertTriangle className="size-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-10">
                Application View Error
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-normal">
                An unexpected JavaScript error occurred while rendering this view.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full p-3 rounded bg-stone-50 dark:bg-stone-950 text-left overflow-x-auto max-h-32 border border-stone-100 dark:border-stone-900">
                <code className="text-[10px] font-mono text-red-650 dark:text-red-400 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <Button 
              onClick={this.handleReset}
              className="bg-stone-900 dark:bg-stone-10 text-white dark:text-stone-950 hover:bg-stone-850 dark:hover:bg-stone-50 flex items-center gap-2 text-xs font-bold px-4 py-2"
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
