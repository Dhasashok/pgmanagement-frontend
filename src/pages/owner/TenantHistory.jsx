import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  X,
  Wallet,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
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
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tenants/history/archive?search=${encodeURIComponent(search)}`);
      if (res.success) {
        setHistory(res.history || res.records || []);
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
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Past Resident Archive & Settlements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {history.length} {history.length === 1 ? 'Resident' : 'Residents'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Departure records, stay tenures, and security deposit refund settlements.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, room, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
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
          description="When residents check out, their departure records and deposit refund settlements will be archived here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {history.map((record) => {
            const depositAmt = Number(record.deposit_amount || 10000);
            const refundAmt = Number(record.refund_amount !== undefined && record.refund_amount !== null ? record.refund_amount : depositAmt);
            const deductionAmt = Number(record.deduction_amount || 0);
            const refundStatus = record.refund_status || (refundAmt > 0 ? 'refunded' : 'settled');

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-xl hover:border-slate-700 transition space-y-3.5"
              >
                {/* Resident Identity Header */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-950 text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700/80 shadow-sm">
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

                  {/* Quick Actions & Checkout Pill */}
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

                {/* Room Allocation Unit */}
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
                  <span className="text-[11px] font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/20">
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

                {/* 🌟 DEDICATED DEPOSIT & REFUND SETTLEMENT SECTION */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2" data-testid="deposit-refund-section">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                      <Wallet className="w-3.5 h-3.5 text-teal-400" />
                      <span>Deposit & Refund Settlement</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      refundStatus === 'refunded' || refundStatus === 'settled'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {refundStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Deposit Paid</span>
                      <span className="text-xs font-bold text-white mt-0.5 block font-mono">
                        ₹{depositAmt.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Deductions</span>
                      <span className={`text-xs font-bold mt-0.5 block font-mono ${deductionAmt > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {deductionAmt > 0 ? `-₹${deductionAmt.toLocaleString('en-IN')}` : '₹0'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-teal-500/20 bg-teal-500/5">
                      <span className="text-[10px] text-teal-400 block font-medium">Net Refund</span>
                      <span className="text-xs font-black text-emerald-400 mt-0.5 block font-mono">
                        ₹{refundAmt.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {deductionAmt > 0 && record.deduction_reason && (
                    <p className="text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                      <strong className="text-slate-300">Deduction Reason: </strong> {record.deduction_reason}
                    </p>
                  )}
                </div>

                {/* Departure Reason & View Full Statement */}
                <div className="flex items-center justify-between pt-1">
                  {record.checkout_reason ? (
                    <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      Reason: <strong className="text-slate-300">{record.checkout_reason}</strong>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Departure completed</span>
                  )}

                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="text-[11px] font-bold text-teal-400 hover:text-teal-300 transition flex items-center gap-1 shrink-0"
                  >
                    <span>Settlement Slip</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL: Full Settlement & Departure Statement */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title="Tenant Settlement Statement"
          subtitle={`Financial closure summary for ${selectedRecord.tenant_name}`}
        >
          <div className="space-y-4 text-xs">
            {/* Resident Card Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-white text-sm">{selectedRecord.tenant_name}</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Room {selectedRecord.room_number || '—'} &bull; Bed {selectedRecord.bed_number || '—'} (Floor {selectedRecord.floor_number || 1})
                </p>
                <p className="text-slate-400 text-[11px]">{selectedRecord.tenant_phone} &bull; {selectedRecord.tenant_email}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[10px]">
                {selectedRecord.refund_status || 'Settled'}
              </span>
            </div>

            {/* Timeline Details */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] block">Move-in Date</span>
                <span className="text-white font-bold">{new Date(selectedRecord.joined_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Checkout Date</span>
                <span className="text-white font-bold">{new Date(selectedRecord.left_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Itemized Deposit & Refund Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <h5 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Deposit Settlement Breakdown</h5>
              
              <div className="flex justify-between text-slate-300">
                <span>Security Deposit Paid at Onboarding</span>
                <span className="font-mono font-bold text-white">₹{Number(selectedRecord.deposit_amount || 10000).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Damage / Painting / Utility Deductions</span>
                <span className={`font-mono font-bold ${Number(selectedRecord.deduction_amount || 0) > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {Number(selectedRecord.deduction_amount || 0) > 0 ? `-₹${Number(selectedRecord.deduction_amount).toLocaleString('en-IN')}` : '₹0.00'}
                </span>
              </div>

              {selectedRecord.deduction_reason && (
                <p className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <strong>Notes: </strong>{selectedRecord.deduction_reason}
                </p>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black">
                <span className="text-teal-300">Net Refund Disbursed</span>
                <span className="font-mono text-emerald-400">
                  ₹{Number(selectedRecord.refund_amount !== undefined ? selectedRecord.refund_amount : (Number(selectedRecord.deposit_amount || 10000) - Number(selectedRecord.deduction_amount || 0))).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Departure Notes */}
            {selectedRecord.checkout_reason && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-300">
                <strong className="text-white block text-[11px] mb-0.5">Departure Reason:</strong>
                {selectedRecord.checkout_reason}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close Statement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TenantHistory;
