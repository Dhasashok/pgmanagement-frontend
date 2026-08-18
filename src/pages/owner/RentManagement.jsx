import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Sparkles,
  Download,
  MessageSquare,
  Building
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const getInitials = (name) => {
  if (!name) return 'TN';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const RentManagement = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('cash');
  const [payNotes, setPayNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Digital Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const loadRentData = async () => {
    try {
      setLoading(true);
      const [recRes, statRes] = await Promise.all([
        api.get(`/rent/records?month_year=${selectedMonth}&status=${statusFilter}&search=${encodeURIComponent(search)}`),
        api.get(`/rent/stats?month_year=${selectedMonth}`)
      ]);

      if (recRes.success) {
        // Enforce client-side sanity check: if pending_amount <= 0, status is paid
        const cleanRecords = (recRes.records || []).map((r) => {
          const isPaid = Number(r.pending_amount || 0) <= 0 || r.status === 'paid';
          return {
            ...r,
            status: isPaid ? 'paid' : r.status,
            pending_amount: isPaid ? 0 : Number(r.pending_amount || 0)
          };
        });
        setRecords(cleanRecords);
      }
      if (statRes.success) setStats(statRes.stats);
    } catch (err) {
      showError('Failed to load rent records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentData();
  }, [selectedMonth, statusFilter, search]);

  const handleGenerateBills = async () => {
    try {
      setSubmitting(true);
      const res = await api.post('/rent/generate', { month_year: selectedMonth });
      if (res.success) {
        showSuccess(res.message || 'Rent bills generated successfully');
        await loadRentData();
      }
    } catch (err) {
      showError(err.message || 'Failed to generate rent bills');
    } finally {
      setSubmitting(false);
    }
  };

  const sendWhatsAppReminder = (record) => {
    const rawPhone = (record.tenant_phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const pgName = 'Royal Orchid PG';
    const amount = Number(record.pending_amount || record.total_amount).toLocaleString('en-IN');
    const month = record.month_year || 'this month';
    const message = `Hi ${record.tenant_name || 'Resident'}, this is a gentle reminder from *${pgName}*. Your rent of *₹${amount}* for *${month}* is currently due. You can pay instantly online via Razorpay/UPI here: https://pg-managementf.netlify.app/tenant/payments . Thank you!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    showSuccess(`Opening WhatsApp to send rent reminder to ${record.tenant_name}`);
  };

  const openRecordPayment = (record) => {
    setSelectedRecord(record);
    setPayAmount(record.pending_amount || record.total_amount);
    setPayMethod('cash');
    setPayNotes('Manual payment received at front desk');
    setPayModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setSubmitting(true);
    try {
      const res = await api.post('/rent/record-payment', {
        rent_record_id: selectedRecord.id,
        amount: payAmount,
        payment_method: payMethod,
        notes: payNotes
      });
      if (res.success) {
        showSuccess(`Payment of ₹${payAmount} recorded! Receipt: ${res.receiptNo}`);
        setPayModalOpen(false);
        await loadRentData();
      }
    } catch (err) {
      showError(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const viewReceipt = async (receiptNo) => {
    if (!receiptNo) return;
    try {
      const res = await api.get(`/payments/receipt/${receiptNo}`);
      if (res.success) {
        setReceiptData(res.receipt);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      showError('Failed to fetch digital receipt');
    }
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>Rent Collection & Dues</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track monthly rental billing, overdue balances, and record collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleGenerateBills}
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Bills</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Rent</span>
          <span className="text-xl font-black text-white">{formatCurrency(stats?.expected_rent)}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{stats?.total_tenants_billed || 0} Tenants Billed</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Collected Rent</span>
          <span className="text-xl font-black text-emerald-400">{formatCurrency(stats?.collected_rent)}</span>
          <span className="text-[10px] text-emerald-300/80 block mt-0.5">
            {Math.round(Number(stats?.collection_rate) || 0)}% Collected
          </span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Due Today ⚡</span>
          <span className="text-xl font-black text-amber-300">{formatCurrency(stats?.due_today_amount)}</span>
          <span className="text-[10px] text-amber-300/80 block mt-0.5">{stats?.due_today_count || 0} Tenants Due</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Pending Rent</span>
          <span className="text-xl font-black text-amber-400">{formatCurrency(stats?.pending_rent)}</span>
          <span className="text-[10px] text-amber-300/80 block mt-0.5">{stats?.pending_count || 0} Total Pending</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-rose-400 block">Overdue Amount</span>
          <span className="text-xl font-black text-rose-400">{formatCurrency(stats?.overdue_rent)}</span>
          <span className="text-[10px] text-rose-300/80 block mt-0.5">{stats?.overdue_count || 0} Overdue Bills</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'due_today', label: `Due Today (${stats?.due_today_count || 0})` },
            { id: 'overdue', label: `Overdue (${stats?.overdue_count || 0})` },
            { id: 'pending', label: 'Pending' },
            { id: 'verification_pending', label: 'Verification Pending' },
            { id: 'paid', label: 'Paid' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                statusFilter === pill.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resident, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 sm:w-64 pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table & Cards */}
      {loading ? (
        <LoadingSpinner label="Loading rent records..." />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title={statusFilter === 'overdue' ? '🎉 All Caught Up!' : 'No Rent Records Found'}
          description={
            statusFilter === 'overdue'
              ? '100% of rent is collected with zero overdue bills for this period.'
              : `No rent bills match the selected filter for ${selectedMonth}.`
          }
          actionText={statusFilter === 'all' ? 'Generate Monthly Bills' : undefined}
          onAction={statusFilter === 'all' ? handleGenerateBills : undefined}
        />
      ) : (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-800/80">
            {records.map((r) => {
              const isPaid = Number(r.pending_amount || 0) <= 0 || r.status === 'paid';
              const isDueToday = !isPaid && String(r.due_date).slice(0, 10) === todayStr;
              const isOverdue = !isPaid && (r.status === 'overdue' || String(r.due_date).slice(0, 10) < todayStr);

              return (
                <div
                  key={r.id}
                  className={`p-4 ${
                    isDueToday
                      ? 'bg-amber-950/25 border-l-4 border-amber-500'
                      : isOverdue
                      ? 'bg-rose-950/20 border-l-4 border-rose-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {r.tenant_photo ? (
                        <img
                          src={r.tenant_photo}
                          alt={r.tenant_name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(r.tenant_name)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm">{r.tenant_name}</p>
                        <p className="text-[11px] text-indigo-300">
                          Floor {r.floor_number || 1} · Room {r.room_number || '—'} · {r.bed_number || '—'}
                        </p>
                      </div>
                    </div>

                    {isPaid ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Paid
                      </span>
                    ) : isDueToday ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                        Due Today
                      </span>
                    ) : (
                      <Badge variant={isOverdue ? 'overdue' : r.status} size="sm">
                        {isOverdue ? 'overdue' : r.status}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Total</span>
                      <span className="font-bold text-white">{formatCurrency(r.total_amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Paid</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(r.paid_amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Due</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-400' : isPaid ? 'text-slate-500' : 'text-amber-400'}`}>
                        {formatCurrency(r.pending_amount)}
                      </span>
                    </div>
                  </div>

                  {!isPaid && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => sendWhatsAppReminder(r)}
                        className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => openRecordPayment(r)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                      >
                        Collect Pay
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Tenant & Room</th>
                  <th className="py-4 px-4">Billing Month</th>
                  <th className="py-4 px-4">Total Rent</th>
                  <th className="py-4 px-4">Paid Amount</th>
                  <th className="py-4 px-4">Pending Dues</th>
                  <th className="py-4 px-4">Due Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {records.map((r) => {
                  const isPaid = Number(r.pending_amount || 0) <= 0 || r.status === 'paid';
                  const isDueToday = !isPaid && String(r.due_date).slice(0, 10) === todayStr;
                  const isOverdue = !isPaid && (r.status === 'overdue' || String(r.due_date).slice(0, 10) < todayStr);

                  return (
                    <tr
                      key={r.id}
                      className={`transition ${
                        isDueToday
                          ? 'bg-amber-950/25 hover:bg-amber-950/35 border-l-2 border-amber-400'
                          : isOverdue
                          ? 'bg-rose-950/20 hover:bg-rose-950/35'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {r.tenant_photo ? (
                            <img
                              src={r.tenant_photo}
                              alt={r.tenant_name}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {getInitials(r.tenant_name)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{r.tenant_name}</p>
                            <p className="text-[11px] text-indigo-400 font-semibold">
                              Floor {r.floor_number || 1} • Room {r.room_number || '101'} • {r.bed_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-white">{r.month_year}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-white text-sm">{formatCurrency(r.total_amount)}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-emerald-400">{formatCurrency(r.paid_amount)}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`font-bold ${isOverdue ? 'text-rose-400' : isPaid ? 'text-slate-500' : 'text-amber-400'}`}>
                          {formatCurrency(r.pending_amount)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isPaid ? (
                          <span className="text-slate-400">{new Date(r.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        ) : isDueToday ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-amber-300">{new Date(r.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
                              Due Today
                            </span>
                          </div>
                        ) : isOverdue ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-rose-300">{new Date(r.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-extrabold text-[10px] border border-rose-500/30">
                              Overdue
                            </span>
                          </div>
                        ) : (
                          <span>{new Date(r.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant={isPaid ? 'paid' : isOverdue ? 'overdue' : r.status} size="sm">
                          {isPaid ? 'paid' : isOverdue ? 'overdue' : r.status}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {!isPaid ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => sendWhatsAppReminder(r)}
                              title="Send WhatsApp Reminder"
                              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">WhatsApp</span>
                            </button>
                            <button
                              onClick={() => openRecordPayment(r)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md"
                            >
                              Collect Pay
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-400 text-xs font-semibold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Cleared</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`Record Payment: ${selectedRecord?.tenant_name}`}
        subtitle={`Room ${selectedRecord?.room_number || '101'} • ${selectedRecord?.month_year || 'Current'}`}
      >
        {selectedRecord && (
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                required
                min="1"
                max={selectedRecord.pending_amount || selectedRecord.total_amount}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="cash">Cash (Front Desk)</option>
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="bank_transfer">Direct Bank NEFT / IMPS</option>
                <option value="card">Debit / Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Notes / Ref</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="e.g. Received cash at reception"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs space-y-1">
              <span className="text-slate-400 block">Pending balance before this payment:</span>
              <span className="font-bold text-white text-sm">{formatCurrency(selectedRecord.pending_amount)}</span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition disabled:opacity-50"
              >
                {submitting ? 'Recording...' : 'Confirm Payment & Generate Receipt'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: View Digital Receipt */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official Rent Receipt"
        subtitle={receiptData?.receipt_number || 'Receipt'}
      >
        {receiptData && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Royal Orchid PG</h4>
                    <p className="text-[10px] text-slate-400">Bengaluru, Karnataka</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-indigo-300 block">{receiptData.receipt_number}</span>
                  <span className="text-[10px] text-slate-400">{new Date(receiptData.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">Tenant Name</span>
                  <span className="font-bold text-white">{receiptData.tenant_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Billing Period</span>
                  <span className="font-bold text-white">{receiptData.month_year}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="text-emerald-300 font-bold">Amount Paid:</span>
                <span className="text-xl font-extrabold text-emerald-400">{formatCurrency(receiptData.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
