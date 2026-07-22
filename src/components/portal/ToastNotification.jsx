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

  // SAC-token accent per toast type — left border accent, solid white card body
  const styles = {
    success: {
      border: 'border-l-[#059669]',
      text: 'text-[#059669]',
      icon: <CheckCircle2 className="size-4 text-[#059669] shrink-0" />
    },
    info: {
      border: 'border-l-blue-600',
      text: 'text-blue-600',
      icon: <Info className="size-4 text-blue-600 shrink-0" />
    },
    warning: {
      border: 'border-l-amber-500',
      text: 'text-amber-600',
      icon: <AlertTriangle className="size-4 text-amber-500 shrink-0" />
    },
    error: {
      border: 'border-l-[#e11d48]',
      text: 'text-[#e11d48]',
      icon: <AlertCircle className="size-4 text-[#e11d48] shrink-0" />
    }
  }[type || 'info'];

  return (
    <div
      role="alert"
      className={`pointer-events-auto border-l-4 p-3.5 bg-white text-slate-900 border border-slate-200 shadow-xl rounded-lg flex items-start gap-3 animate-slide-in-right ${styles.border}`}
    >
      <div className="mt-0.5">{styles.icon}</div>
      <div className="flex-1 space-y-0.5 pr-2">
        <h5 className={`font-bold text-[11px] uppercase tracking-wider ${styles.text}`}>{type || 'info'}</h5>
        <p className="text-[11px] font-semibold leading-relaxed text-slate-700">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors duration-150 p-0.5 rounded-md cursor-pointer mt-0.5 shrink-0"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
