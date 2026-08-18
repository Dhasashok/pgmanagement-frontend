import React from 'react';

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className={`animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizeMap[size] || sizeMap.md}`} />
      {label && <p className="text-xs font-medium text-neutral-400">{label}</p>}
    </div>
  );
};
export default LoadingSpinner;
