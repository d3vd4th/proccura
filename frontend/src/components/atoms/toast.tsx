import * as React from 'react';
import { createContext, useContext, useCallback, useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { ...toast, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after duration (default 5 seconds)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    const { addToast, removeToast } = context;

    return {
        toast: {
            success: (message: string, title?: string) =>
                addToast({ type: 'success', message, title }),
            error: (message: string, title?: string) =>
                addToast({ type: 'error', message, title }),
            warning: (message: string, title?: string) =>
                addToast({ type: 'warning', message, title }),
            info: (message: string, title?: string) =>
                addToast({ type: 'info', message, title }),
        },
        dismiss: removeToast,
    };
};

// Toast styling config - shadcn/ui style
const toastConfig: Record<ToastType, { icon: React.ElementType; iconClassName: string; borderClassName: string }> = {
    success: {
        icon: CheckCircle2,
        iconClassName: 'text-green-500',
        borderClassName: 'border-l-green-500',
    },
    error: {
        icon: AlertCircle,
        iconClassName: 'text-destructive',
        borderClassName: 'border-l-destructive',
    },
    warning: {
        icon: AlertTriangle,
        iconClassName: 'text-yellow-500',
        borderClassName: 'border-l-yellow-500',
    },
    info: {
        icon: Info,
        iconClassName: 'text-blue-500',
        borderClassName: 'border-l-blue-500',
    },
};

// Individual Toast Component - shadcn/ui style
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
    toast,
    onDismiss,
}) => {
    const { icon: Icon, iconClassName, borderClassName } = toastConfig[toast.type];

    return (
        <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={cn(
                'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border border-l-4 bg-background p-3 pr-3 shadow-lg transition-all',
                'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
                'animate-in slide-in-from-top-full fade-in-0 duration-300',
                borderClassName
            )}
        >
            <div className="flex items-start gap-3">
                <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconClassName)} />
                <div className="grid gap-1">
                    {toast.title && (
                        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{toast.message}</p>
                </div>
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

// Toast Container (renders all toasts) - top-right
const ToastContainer: React.FC = () => {
    const context = useContext(ToastContext);
    if (!context) return null;

    const { toasts, removeToast } = context;

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:bottom-4 sm:right-4 md:max-w-[420px]"
            aria-label="Notifications"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};

export { ToastContainer };