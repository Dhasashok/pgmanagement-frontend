import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Search,
  Building,
  BedDouble,
  Calendar,
  DollarSign,
  UserCheck,
  CheckCircle,
  FileText
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';

export const TenantHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tenants/history/archive?search=${encodeURIComponent(search)}`);
      if (res.success) {
        setHistory(res.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search]);

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Preserved Tenant History Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Permanent archive of past residents, stay periods, rooms occupied, and checkout reasons.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search past tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 sm:w-72 pl-8 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* History Records */}
      {loading ? (
        <LoadingSpinner label="Loading historical archive..." />
      ) : history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Historical Records"
          description="When residents checkout, their stay duration and payment ledger will be preserved here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/30 space-y-4 transition"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-white">{record.tenant_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{record.tenant_phone}</span>
                    <span>•</span>
                    <span>{record.tenant_email}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[10px] font-bold">
                  Stay: {record.total_months_stayed} {record.total_months_stayed === 1 ? 'Month' : 'Months'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Previous Allocation</span>
                  <span className="font-bold text-white">Floor {record.floor_number} • Room {record.room_number}</span>
                  <span className="text-indigo-400 block font-semibold">{record.bed_number}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Lifetime Rent Paid</span>
                  <span className="font-bold text-emerald-400 text-sm">{formatCurrency(record.total_rent_paid)}</span>
                  <span className="text-slate-400 text-[10px] block">100% Cleared</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Joined: {new Date(record.joined_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>Left: {new Date(record.left_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <p className="text-slate-300 pt-1 border-t border-slate-800/60">
                  <strong>Departure Note: </strong>{record.checkout_reason || 'Normal check-out upon tenure completion.'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
