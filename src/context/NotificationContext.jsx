import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext();

const ICONS = {
  success: { icon: CheckCircle, cls: 'text-emerald-500', bar: 'bg-emerald-500' },
  error:   { icon: XCircle,     cls: 'text-red-500',     bar: 'bg-red-500' },
  info:    { icon: Info,        cls: 'text-primary-500',  bar: 'bg-primary-500' },
  warning: { icon: AlertTriangle,cls:'text-amber-500',   bar: 'bg-amber-500' },
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => removeToast(id), 4500);
    return id;
  }, [removeToast]);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError   = useCallback((msg) => addToast(msg, 'error'),   [addToast]);
  const showInfo    = useCallback((msg) => addToast(msg, 'info'),    [addToast]);
  const showWarning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, showSuccess, showError, showInfo, showWarning }}>
      {children}

      {/* Toast Container */}
      <div className="toast-container" style={{ fontFamily: 'Inter, sans-serif' }}>
        <AnimatePresence>
          {toasts.map((toast) => {
            const { icon: Icon, cls, bar } = ICONS[toast.type] || ICONS.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`toast toast-${toast.type}`}
              >
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cls}`} />
                <p className="flex-1 text-xs leading-relaxed">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
