import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'teal', trend, trendLabel }) => {
  const colorMap = {
    teal:   { bg: 'bg-primary-50',   icon: 'text-primary-600',   border: 'border-primary-100' },
    blue:   { bg: 'bg-accent-50',    icon: 'text-accent-600',    border: 'border-blue-100' },
    green:  { bg: 'bg-emerald-50',   icon: 'text-emerald-600',   border: 'border-emerald-100' },
    amber:  { bg: 'bg-amber-50',     icon: 'text-amber-600',     border: 'border-amber-100' },
    red:    { bg: 'bg-red-50',       icon: 'text-red-600',       border: 'border-red-100' },
    purple: { bg: 'bg-violet-50',    icon: 'text-violet-600',    border: 'border-violet-100' },
    indigo: { bg: 'bg-indigo-50',    icon: 'text-indigo-600',    border: 'border-indigo-100' },
    emerald:{ bg: 'bg-emerald-50',   icon: 'text-emerald-600',   border: 'border-emerald-100' },
  };

  const c = colorMap[color] || colorMap.teal;

  return (
    <div className="stat-card animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border} shrink-0`}>
          {Icon && <Icon className={`w-5 h-5 ${c.icon}`} />}
        </div>
        {trend !== undefined && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-neutral-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-neutral-700 mt-1">{title}</p>
        {subtitle && <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>}
        {trendLabel && <p className="text-[11px] text-neutral-400 mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
};

export default StatCard;
