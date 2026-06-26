import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ToastNotification({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.slice(0, 3).map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const { id, type, message, duration = 5000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Premium, high-contrast, flat style matching "The Steel Scaffold" design system
  const styles = {
    success: {
      border: 'border-green-500 bg-green-50 text-green-900',
      icon: <CheckCircle2 className="size-4 text-green-600 shrink-0" />
    },
    info: {
      border: 'border-blue-500 bg-blue-50 text-blue-900',
      icon: <Info className="size-4 text-blue-600 shrink-0" />
    },
    warning: {
      border: 'border-amber-500 bg-amber-50 text-amber-900',
      icon: <AlertTriangle className="size-4 text-amber-600 shrink-0" />
    },
    error: {
      border: 'border-red-500 bg-red-50 text-red-900',
      icon: <AlertCircle className="size-4 text-red-600 shrink-0" />
    }
  }[type || 'info'];

  return (
    <div
      role="alert"
      className={`pointer-events-auto border-l-4 p-3.5 bg-white shadow-lg rounded border border-gray-200 flex items-start gap-3 animate-slide-in-right ${styles.border}`}
    >
      <div className="mt-0.5">{styles.icon}</div>
      <div className="flex-1 space-y-0.5 pr-2">
        <h5 className="font-bold text-xs uppercase tracking-wider">{type || 'info'}</h5>
        <p className="text-[11px] font-medium leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded cursor-pointer mt-0.5 shrink-0"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
