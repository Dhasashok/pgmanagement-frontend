import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Search,
  BedDouble,
  Calendar,
  Phone,
  MessageSquare,
  DoorOpen,
  UserX,
  Clock,
  ArrowRight
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';

const getInitials = (name) => {
  if (!name) return 'TN';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

  const openWhatsApp = (e, phone, name) => {
    e.stopPropagation();
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Hi ${name || 'Resident'}, greeting from Royal Orchid PG.`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Past Resident Archive
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {history.length} {history.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical ledger of checked-out residents and departure details.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, room, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* History Records */}
      {loading ? (
        <LoadingSpinner label="Loading past resident archive..." />
      ) : history.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="No Past Resident Records"
          description="When residents check out, their record and departure notes will be archived here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {history.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg hover:border-slate-700 transition space-y-3.5"
            >
              {/* Resident Identity Header */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-950 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700/80 shadow-sm">
                    {getInitials(record.tenant_name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                      {record.tenant_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-xs font-mono font-semibold text-slate-300 whitespace-nowrap">
                        {record.tenant_phone || 'No phone'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions (Call/WhatsApp) & Status */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {record.tenant_phone && (
                    <button
                      onClick={(e) => openWhatsApp(e, record.tenant_phone, record.tenant_name)}
                      title="WhatsApp Resident"
                      className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    Checked Out
                  </span>
                </div>
              </div>

              {/* Room Allocation Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-none">
                      Allocated Unit
                    </span>
                    <span className="text-xs font-bold text-white mt-0.5 block">
                      Room {record.room_number || '—'} &bull; {record.bed_number || 'Bed'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                  Floor {record.floor_number || '1'}
                </span>
              </div>

              {/* Stay Timeline */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Joined: <strong className="text-slate-300">{new Date(record.joined_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Left: <strong className="text-slate-300">{new Date(record.left_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                </div>
              </div>

              {/* Departure Reason */}
              {record.checkout_reason && (
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                    Reason for Leaving
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {record.checkout_reason}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantHistory;
