import React from 'react';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const LABELS = {
  dashboard: 'Dashboard', 'rooms-availability': 'Room Availability', 'building-structure': 'Building Manager',
  tenants: 'Tenant Directory', 'rent-management': 'Rent Management',
  'payment-verification': 'Verify Payments', 'tenant-history': 'Tenant History', 'occupancy-analytics': 'Occupancy Analytics',
  'financial-dashboard': 'Financial Reports', complaints: 'Maintenance', announcements: 'Announcements', settings: 'Settings',
  room: 'My Room & Bed', payments: 'Pay Rent', 'payment-history': 'Payment History', profile: 'My Profile'
};

export const Breadcrumbs = ({ portalLabel }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split('/').filter(Boolean);
  const currentLabel = LABELS[segments.at(-1)] || portalLabel;
  const canGoBack = segments.length > 2 && !location.pathname.endsWith('/dashboard');

  return (
    <div className="flex items-center gap-2 min-w-0">
      {canGoBack && (
        <button onClick={() => navigate(-1)} className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-slate-800 transition" aria-label="Go back">
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <Home className="w-3.5 h-3.5 text-primary-400 shrink-0" />
      <span className="text-xs text-neutral-400 hidden sm:inline">{portalLabel}</span>
      <ChevronRight className="w-3.5 h-3.5 text-neutral-500 hidden sm:block" />
      <span className="text-sm font-semibold text-neutral-800 truncate">{currentLabel}</span>
    </div>
  );
};
