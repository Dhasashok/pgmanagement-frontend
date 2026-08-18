import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variantMap = {
    occupied:             'badge-success', // 🟢 Green Occupied
    active:               'badge-success',
    paid:                 'badge-success',
    available:            'badge-danger',  // 🔴 Red Vacant / Ready to Rent
    vacant:               'badge-danger',
    available_red:        'badge-danger',
    reserved:             'badge-warning', // 🟡 Yellow Reserved / Joining Soon
    pre_booked:           'badge-warning',
    pending:              'badge-warning',
    notice_period:        'badge-warning',
    overdue:              'badge-danger',
    maintenance:          'badge-warning',
    verification_pending: 'badge-purple',
    checked_out:          'badge-gray',
    default:              'badge-gray',
  };

  const sizeMap = {
    sm:  'text-[10px] px-2 py-0.5',
    md:  'text-[11px] px-2.5 py-0.5',
    lg:  'text-xs px-3 py-1',
  };

  return (
    <span className={`badge ${variantMap[variant] || variantMap.default} ${sizeMap[size]}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
};

export default Badge;
