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

  // SAC-token accent per toast type — left border accent, surface card body
  const styles = {
    success: {
      border: 'border-l-[#16A34A]',
      text: 'text-[#16A34A]',
      icon: <CheckCircle2 className="size-4 text-[#16A34A] shrink-0" />
    },
    info: {
      border: 'border-l-[rgb(var(--color-emerald-default-rgb))]',
      text: 'text-text-primary',
      icon: <Info className="size-4 shrink-0" style={{ color: 'rgb(var(--color-emerald-default-rgb))' }} />
    },
    warning: {
      border: 'border-l-amber-500',
      text: 'text-amber-600',
      icon: <AlertTriangle className="size-4 text-amber-500 shrink-0" />
    },
    error: {
      border: 'border-l-[#EF4444]',
      text: 'text-[#EF4444]',
      icon: <AlertCircle className="size-4 text-[#EF4444] shrink-0" />
    }
  }[type || 'info'];

  return (
    <div
      role="alert"
      className={`pointer-events-auto border-l-4 p-3.5 card flex items-start gap-3 animate-slide-in-right ${styles.border}`}
    >
      <div className="mt-0.5">{styles.icon}</div>
      <div className="flex-1 space-y-0.5 pr-2">
        <h5 className={`font-bold text-[11px] uppercase tracking-wider ${styles.text}`}>{type || 'info'}</h5>
        <p className="text-[11px] font-medium leading-relaxed text-text-secondary">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-text-tertiary hover:text-text-primary transition-colors duration-150 p-0.5 rounded-md cursor-pointer mt-0.5 shrink-0"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
