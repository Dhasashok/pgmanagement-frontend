import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  trend,
  trendLabel,
  onClick
}) => {
  const colorMap = {
    teal: {
      bg: 'from-teal-500/20 to-emerald-500/10',
      iconBg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      border: 'hover:border-teal-500/40',
      glow: 'group-hover:shadow-teal-500/10'
    },
    emerald: {
      bg: 'from-emerald-500/20 to-teal-500/10',
      iconBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      border: 'hover:border-emerald-500/40',
      glow: 'group-hover:shadow-emerald-500/10'
    },
    indigo: {
      bg: 'from-indigo-500/20 to-blue-500/10',
      iconBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      border: 'hover:border-indigo-500/40',
      glow: 'group-hover:shadow-indigo-500/10'
    },
    amber: {
      bg: 'from-amber-500/20 to-orange-500/10',
      iconBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      border: 'hover:border-amber-500/40',
      glow: 'group-hover:shadow-amber-500/10'
    },
    blue: {
      bg: 'from-blue-500/20 to-cyan-500/10',
      iconBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      border: 'hover:border-blue-500/40',
      glow: 'group-hover:shadow-blue-500/10'
    },
    purple: {
      bg: 'from-purple-500/20 to-pink-500/10',
      iconBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      border: 'hover:border-purple-500/40',
      glow: 'group-hover:shadow-purple-500/10'
    },
    red: {
      bg: 'from-red-500/20 to-rose-500/10',
      iconBg: 'bg-red-500/15 text-red-300 border-red-500/30',
      border: 'hover:border-red-500/40',
      glow: 'group-hover:shadow-red-500/10'
    }
  };

  const c = colorMap[color] || colorMap.teal;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b ${c.bg} bg-slate-900/90 border border-slate-800/90 ${c.border} p-3.5 sm:p-5 transition-all duration-200 shadow-lg ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      {/* Background ambient glow highlight */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between gap-2">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${c.iconBg} border flex items-center justify-center shrink-0 shadow-sm`}>
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        {trend !== undefined && (
          <span
            className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full ${
              trend >= 0
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
          {value}
        </p>
        <p className="text-xs font-bold text-slate-200 mt-1.5 truncate">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate leading-tight">
            {subtitle}
          </p>
        )}
        {trendLabel && (
          <p className="text-[10px] text-slate-400 mt-1 truncate">{trendLabel}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
