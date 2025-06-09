'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export const toast = {
  success: (message: string) => {
    const toast: ToastMessage = {
      id: Date.now().toString(),
      type: 'success',
      message,
    };
    toastListeners.forEach(listener => listener(toast));
  },
  error: (message: string) => {
    const toast: ToastMessage = {
      id: Date.now().toString(),
      type: 'error',
      message,
    };
    toastListeners.forEach(listener => listener(toast));
  },
  info: (message: string) => {
    const toast: ToastMessage = {
      id: Date.now().toString(),
      type: 'info',
      message,
    };
    toastListeners.forEach(listener => listener(toast));
  },
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };

    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg min-w-[300px] ${
            toast.type === 'success' ? 'bg-green-50 text-green-900' :
            toast.type === 'error' ? 'bg-red-50 text-red-900' :
            'bg-blue-50 text-blue-900'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}