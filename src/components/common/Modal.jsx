import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 pt-4 sm:pt-10 pb-8 sm:px-6 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={`w-full ${maxWidth} bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
        >
          {/* Sticky Modal Header */}
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-900 shrink-0">
            <div className="pr-3">
              {title && <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">{title}</h3>}
              {subtitle && <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-snug">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;
