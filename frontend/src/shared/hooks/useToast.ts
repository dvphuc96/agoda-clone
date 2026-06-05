import { useCallback } from 'react';
import { toast, type ToastOptions } from 'react-toastify';

export type ToastType = 'success' | 'error' | 'info';

const toastOptions: Record<ToastType, ToastOptions> = {
  success: { autoClose: 3000 },
  error: { autoClose: 5000 },
  info: { autoClose: 3000 },
};

export function useToast() {
  const addToast = useCallback((type: ToastType, message: string) => {
    toast[type](message, toastOptions[type]);
  }, []);

  return {
    addToast,
    success: useCallback((message: string) => addToast('success', message), [addToast]),
    error: useCallback((message: string) => addToast('error', message), [addToast]),
    info: useCallback((message: string) => addToast('info', message), [addToast]),
  };
}
