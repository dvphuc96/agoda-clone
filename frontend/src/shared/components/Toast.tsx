import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: number) => void;
}

import { createContext, useContext } from 'react';

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, type, message }]);
      const duration = type === 'error' ? 5000 : 3000;
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  return (
    <ToastContext value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext>
  );
}

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: 'border-success/30 bg-success/5',
  error: 'border-destructive/30 bg-destructive/5',
  info: 'border-primary/30 bg-primary/5',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-primary',
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed right-4 top-20 z-[100] flex flex-col gap-2"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-spring-fast ${styles[toast.type]}`}
          >
            <Icon className={`mt-0.5 size-4 shrink-0 ${iconStyles[toast.type]}`} />
            <p className="min-w-0 flex-1 text-sm font-medium text-text">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-text-secondary transition-spring-fast hover:text-text"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
