import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Users,
  Megaphone,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Phone,
  Clock,
  BedDouble,
  Building
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const TenantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [property, setProperty] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, ancRes, propRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/announcements'),
        api.get('/pg/property')
      ]);

      if (userRes.success && userRes.user?.tenant) {
        // Fetch full profile
        const fullRes = await api.get(`/tenants/${userRes.user.tenant.id}`);
        if (fullRes.success) setTenantProfile(fullRes.tenant);
      }
      if (ancRes.success) setAnnouncements(ancRes.announcements?.slice(0, 3) || []);
      if (propRes.success) setProperty(propRes.property);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading your resident dashboard..." />;
  }

  // Get current active month rent record
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentRent = tenantProfile?.rentRecords?.find(r => r.month_year === currentMonth) || tenantProfile?.rentRecords?.[0];
  const isPaid = currentRent?.status === 'paid';
  const isPendingVerification = currentRent?.status === 'verification_pending';

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Modern, Highly Responsive Welcome Banner */}
      <div className="glass-card p-5 sm:p-7 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          {/* User Identity & Avatar */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
              alt={user?.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
                  Welcome back, {user?.name}!
                </h1>
                <Badge variant="active">Active Resident</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{property?.name || 'Royal Orchid PG'}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">ID: {tenantProfile?.id || 'tnt-001'}</span>
              </p>
            </div>
          </div>

          {/* Assigned Stay Pill */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-950/70 border border-indigo-500/30 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">Assigned Stay</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-white">
                  Floor {tenantProfile?.floor_number || 1} • Room {tenantProfile?.room_number || '101'}
                </span>
                <span className="text-[11px] font-extrabold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                  {tenantProfile?.bed_number || 'BED 01'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Rent Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rent Dues Highlight Box (7 cols) */}
        <div className="lg:col-span-7 glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Monthly Rent Status</h3>
                  <p className="text-xs text-slate-400">Billing Period: {currentRent?.month_year || currentMonth}</p>
                </div>
              </div>

              <Badge variant={currentRent?.status || 'pending'}>{currentRent?.status || 'pending'}</Badge>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 text-[11px] block mb-1">Monthly Tariff</span>
                <span className="text-2xl font-black text-white">{formatCurrency(currentRent?.total_amount || tenantProfile?.monthly_rent || 6000)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Includes Wi-Fi & 3x Meals</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 text-[11px] block mb-1">Rent Due Date</span>
                <span className="text-lg font-bold text-amber-300">
                  {currentRent?.due_date ? new Date(currentRent.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '5th of Month'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Due on 5th of every month</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            {isPaid ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Rent Cleared for this Month</span>
                </div>
                <button
                  onClick={() => navigate('/tenant/payment-history')}
                  className="text-xs font-bold text-indigo-400 hover:underline"
                >
                  View Receipt
                </button>
              </div>
            ) : isPendingVerification ? (
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Clock className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Payment proof under review by Owner</span>
                </div>
                <button
                  onClick={() => navigate('/tenant/payments')}
                  className="text-xs font-bold text-purple-300 hover:underline"
                >
                  Details
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/tenant/payments')}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Pay Rent Online / Scan QR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Roommates & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Roommates Card */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>My Roommates</span>
              </h3>
              <button
                onClick={() => navigate('/tenant/room')}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                Room Details
              </button>
            </div>

            <div className="space-y-2.5">
              {!tenantProfile?.roommates || tenantProfile.roommates.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No other roommates in this room.</p>
              ) : (
                tenantProfile.roommates.map((rm) => (
                  <div
                    key={rm.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/tenant/room')}
                    onKeyDown={(event) => event.key === 'Enter' && navigate('/tenant/room')}
                    className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rm.profile_photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                        alt={rm.full_name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{rm.full_name}</p>
                        <p className="text-[10px] text-slate-400">{rm.occupation_type === 'working' ? rm.company_name || 'Working' : rm.college_name || 'Student'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-bold rounded-md">
                      {rm.bed_number}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Help / Maintenance Request - Responsive Clean Layout */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-white">Need Quick Repairs?</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Wi-Fi, plumbing, cleaning, or electrical help.</p>
            </div>
            <button
              onClick={() => navigate('/tenant/complaints')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0 self-start sm:self-auto"
            >
              Raise Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
