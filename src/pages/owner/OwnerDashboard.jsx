import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BedDouble,
  Receipt,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const getInitials = (name) => {
  if (!name) return 'TN';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [pendingProofs, setPendingProofs] = useState([]);
  const [activeMobileTab, setActiveMobileTab] = useState('payments'); // 'payments' | 'proofs'

  const load = async () => {
    try {
      setLoading(true);
      const [sumRes, payRes, proofRes] = await Promise.all([
        api.get('/analytics/dashboard-summary'),
        api.get('/payments/history?limit=5'),
        api.get('/payments/proofs?status=pending')
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (payRes.success) setRecentPayments(payRes.payments?.slice(0, 5) || []);
      if (proofRes.success) setPendingProofs(proofRes.proofs?.slice(0, 3) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const sendWhatsAppReminder = (e, t) => {
    e.stopPropagation();
    const rawPhone = (t.tenant_phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const pgName = 'Royal Orchid PG';
    const amount = Number(t.pending_amount || 0).toLocaleString('en-IN');
    const message = `Hi ${t.tenant_name || 'Resident'}, this is a friendly reminder from *${pgName}*. Your rent of *₹${amount}* is due today. You can pay instantly online via UPI/Card here: https://pg-managementf.netlify.app/tenant/payments . Thank you!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Only show tenants with actual unpaid balances (> 0)
  const validDueTenants = (summary?.due_today_tenants || []).filter(
    (t) => Number(t.pending_amount || 0) > 0 && t.status !== 'paid'
  );
  const totalReceivableToday = validDueTenants.reduce(
    (acc, t) => acc + Number(t.pending_amount || 0),
    0
  );

  const roundedOccupancy = Math.round(Number(summary?.occupancy_rate) || 0);
  const roundedCollection = Math.round(Number(summary?.collection_rate) || 0);

  return (
    <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto">
      {/* Top Greeting Header (Clean, no redundant buttons) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Hello, {user?.name?.split(' ')[0] || 'Rajesh'}
            <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {today} &bull; Royal Orchid PG
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Operational</span>
        </div>
      </div>

      {/* UNIFIED EXECUTIVE SNAPSHOT CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/60 border border-slate-800/80 p-4 sm:p-6 shadow-2xl shadow-slate-950/50">
        {/* Subtle Ambient Mesh Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Snapshot Header */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              {currentMonth} Snapshot
            </span>
            <button
              onClick={() => navigate('/owner/financial-dashboard')}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>Financial Reports</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Primary Metrics: Revenue & Occupancy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Revenue */}
            <div
              onClick={() => navigate('/owner/financial-dashboard')}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 cursor-pointer hover:border-slate-700 transition"
            >
              <span className="text-xs font-semibold text-slate-400 block">Cleared Revenue</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {fmt(summary?.monthly_revenue)}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {roundedCollection}% Cleared
                </span>
              </div>
            </div>

            {/* Occupancy */}
            <div
              onClick={() => navigate('/owner/rooms-availability')}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 cursor-pointer hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-400">Bed Occupancy</span>
                <span className="text-[11px] font-bold text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full border border-teal-500/20">
                  {summary?.available_beds || 0} Vacant
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {summary?.occupied_beds || 0} <span className="text-sm font-semibold text-slate-400">/ {summary?.total_beds || 0} Beds ({roundedOccupancy}%)</span>
              </p>
            </div>
          </div>

          {/* Secondary Quick Metrics Row */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
            <div
              onClick={() => navigate('/owner/rent-management')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer"
            >
              <div>
                <span className="text-[10px] text-slate-400 block">Outstanding Dues</span>
                <span className="text-xs sm:text-sm font-black text-amber-400">
                  {fmt(summary?.pending_rent)}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div
              onClick={() => navigate('/owner/tenants')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer"
            >
              <div>
                <span className="text-[10px] text-slate-400 block">Active Residents</span>
                <span className="text-xs sm:text-sm font-black text-indigo-300">
                  {summary?.active_tenants || 0} Tenants
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* URGENT DUE TODAY FOLLOW-UP TRAY (Only rendered when unpaid dues exist today) */}
      {validDueTenants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 p-3.5 sm:p-4 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-amber-200">
                Rent Due Today &bull; {validDueTenants.length} Resident(s) ({fmt(totalReceivableToday)})
              </h2>
            </div>
            <button
              onClick={() => navigate('/owner/rent-management')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
            >
              <span>Collect All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {validDueTenants.map((t) => (
              <div
                key={t.record_id}
                onClick={() => navigate('/owner/rent-management')}
                className="min-w-[260px] sm:min-w-0 flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 transition cursor-pointer shrink-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {t.profile_photo_url ? (
                    <img
                      src={t.profile_photo_url}
                      alt={t.tenant_name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(t.tenant_name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{t.tenant_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Room {t.room_number || '—'} &bull; Bed {t.bed_number || '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-amber-300">{fmt(t.pending_amount)}</p>
                    <span className="text-[9px] text-amber-400/90 font-medium">Due Today</span>
                  </div>
                  <button
                    onClick={(e) => sendWhatsAppReminder(e, t)}
                    title="Send WhatsApp Reminder"
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition active:scale-90"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* LIVE ACTIVITY FEED (Recent Payments & Verification Proofs) */}
      <div className="space-y-3">
        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveMobileTab('payments')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeMobileTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recent Payments ({recentPayments.length})
          </button>
          <button
            onClick={() => setActiveMobileTab('proofs')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition relative ${
              activeMobileTab === 'proofs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Verification ({pendingProofs.length})
            {pendingProofs.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full">
                {pendingProofs.length}
              </span>
            )}
          </button>
        </div>

        {/* Responsive Dual Grid on Desktop, Tabbed on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Recent Cleared Payments */}
          <div
            className={`bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden ${
              activeMobileTab !== 'payments' ? 'hidden sm:block' : ''
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/30">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs sm:text-sm font-bold text-white">Recent Payments</h2>
              </div>
              <button
                onClick={() => navigate('/owner/payment-verification')}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {recentPayments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No recent payments logged</div>
              ) : (
                recentPayments.map((pay) => (
                  <div
                    key={pay.id}
                    onClick={() => navigate('/owner/rent-management')}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/30 transition cursor-pointer active:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20 font-bold text-xs">
                        ₹
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {pay.tenant_name || 'Resident'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {pay.receipt_no || 'Manual Entry'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-emerald-400">{fmt(pay.amount)}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(pay.payment_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Payment Proofs */}
          <div
            className={`bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden ${
              activeMobileTab !== 'proofs' ? 'hidden sm:block' : ''
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs sm:text-sm font-bold text-white">Pending Verification</h2>
                {pendingProofs.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                    {pendingProofs.length} New
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate('/owner/payment-verification')}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                Verify All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {pendingProofs.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-xs font-semibold">All online proofs verified!</p>
                </div>
              ) : (
                pendingProofs.map((proof) => (
                  <div
                    key={proof.id}
                    onClick={() => navigate('/owner/payment-verification')}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/30 transition cursor-pointer active:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{proof.tenant_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {proof.month_year} &bull; {proof.payment_method || 'UPI'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs font-bold text-white">{fmt(proof.amount)}</p>
                      <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-[9px] font-bold">
                        Verify
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
