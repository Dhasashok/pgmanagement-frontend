import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BedDouble,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Layers,
  BellRing,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-xs text-slate-400 mt-0.5">{today} &mdash; Property overview & operational status</p>
        </div>

        {/* Quick Direct Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/owner/tenants')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Add Resident</span>
          </button>
          <button
            onClick={() => navigate('/owner/rooms-availability')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <BedDouble className="w-3.5 h-3.5 text-indigo-400" />
            <span>Bed Matrix</span>
          </button>
        </div>
      </div>

      {/* Due Today Alert Banner (Rendered only when unpaid dues exist) */}
      {validDueTenants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/30 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                    Due Today
                  </span>
                  <p className="text-sm font-bold text-white">
                    {validDueTenants.length} Resident(s) have rent due today
                  </p>
                </div>
                <p className="text-xs text-amber-200/80 mt-1">
                  Total Receivable Today: <span className="font-bold text-white">{fmt(totalReceivableToday)}</span>. Follow up or collect offline.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/owner/rent-management')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shrink-0"
            >
              Collect Rent Today <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Tenant Due List with 1-Click WhatsApp */}
          <div className="mt-4 pt-4 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {validDueTenants.slice(0, 3).map((t) => (
              <div
                key={t.record_id}
                onClick={() => navigate('/owner/rent-management')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/40 transition cursor-pointer"
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
                      Room {t.room_number || '—'} • {t.bed_number || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-300">{fmt(t.pending_amount)}</p>
                    <span className="text-[10px] text-amber-400/90 font-semibold">Due Today</span>
                  </div>
                  <button
                    onClick={(e) => sendWhatsAppReminder(e, t)}
                    title="Send WhatsApp Reminder"
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Occupancy Rate Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-emerald-400" />
              <span>Beds Occupancy</span>
            </span>
            <span className="font-extrabold text-white">
              {summary?.occupied_beds || 0} / {summary?.total_beds || 0} Beds ({roundedOccupancy}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(roundedOccupancy, 100)}%` }}
            />
          </div>
        </div>

        {/* Collection Efficiency Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Rent Collection Efficiency</span>
            </span>
            <span className="font-extrabold text-white">
              {roundedCollection}% Cleared
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(roundedCollection, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clean 4-Card Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Revenue"
          value={fmt(summary?.monthly_revenue)}
          subtitle="Cleared this month"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Pending Dues"
          value={fmt(summary?.pending_rent)}
          subtitle="Outstanding receivables"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Active Residents"
          value={summary?.active_tenants || 0}
          subtitle="Checked-in tenants"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Vacant Beds"
          value={summary?.available_beds || 0}
          subtitle="Ready for allocation"
          icon={BedDouble}
          color="teal"
        />
      </div>

      {/* Two Column: Recent Payments + Pending Proofs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Cleared Payments */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Recent Payments</h2>
            <button
              onClick={() => navigate('/owner/payment-verification')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No payments recorded yet</p>
            ) : (
              recentPayments.map((pay) => (
                <div
                  key={pay.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate('/owner/rent-management')}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/owner/rent-management')}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{pay.tenant_name || 'Resident'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{pay.receipt_no}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">{fmt(pay.amount)}</p>
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Pending Verification</h2>
              {pendingProofs.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full">
                  {pendingProofs.length} New
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/owner/payment-verification')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              Review All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {pendingProofs.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <p className="text-xs font-semibold">All proofs verified — Great work!</p>
              </div>
            ) : (
              pendingProofs.map((proof) => (
                <div
                  key={proof.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate('/owner/payment-verification')}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/owner/payment-verification')}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{proof.tenant_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {proof.month_year} • {proof.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{fmt(proof.amount)}</p>
                    <Badge variant="verification_pending">Pending</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-5">
        <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Add Resident',
              icon: Users,
              path: '/owner/tenants',
              color: 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/25'
            },
            {
              label: 'Bed Availability',
              icon: BedDouble,
              path: '/owner/rooms-availability',
              color: 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/25'
            },
            {
              label: 'Rent Management',
              icon: DollarSign,
              path: '/owner/rent-management',
              color: 'bg-teal-600/15 text-teal-400 border border-teal-500/30 hover:bg-teal-600/25'
            },
            {
              label: 'Verify Payments',
              icon: CheckCircle,
              path: '/owner/payment-verification',
              color: 'bg-purple-600/15 text-purple-400 border border-purple-500/30 hover:bg-purple-600/25'
            }
          ].map(({ label, icon: Icon, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl ${color} transition text-center cursor-pointer`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
