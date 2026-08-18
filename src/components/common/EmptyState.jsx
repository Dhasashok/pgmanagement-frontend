import React from 'react';
import { motion } from 'framer-motion';

export const EmptyState = ({ icon: Icon, title, description, actionText, onAction, celebratory = false }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.25 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-xl space-y-4 max-w-lg mx-auto"
  >
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
      celebratory
        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-950/40'
        : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-400 border border-indigo-500/30 shadow-indigo-950/40'
    }`}>
      {Icon && <Icon className="w-8 h-8" />}
    </div>
    
    <div className="space-y-1.5 max-w-sm">
      <h4 className="text-base font-extrabold text-white tracking-tight">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>

    {actionText && onAction && (
      <button
        onClick={onAction}
        className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/50 transition-all duration-200 hover:-translate-y-0.5"
      >
        {actionText}
      </button>
    )}
  </motion.div>
);

export default EmptyState;
