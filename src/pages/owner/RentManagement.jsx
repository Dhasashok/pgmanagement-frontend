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
  Building,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileSpreadsheet,
  Zap,
  Check,
  Send
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
  const { showSuccess, showError, showInfo } = useNotification();
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

  const changeMonth = (delta) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yStr}-${mStr}`);
  };

  const isCurrentMonth = selectedMonth === new Date().toISOString().slice(0, 7);

  const sendWhatsAppReminder = (record) => {
    const rawPhone = (record.tenant_phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const pgName = 'Royal Orchid PG';
    const amount = Number(record.pending_amount || record.total_amount).toLocaleString('en-IN');
    const month = record.month_year || 'this month';
    const message = `Hi ${record.tenant_name || 'Resident'}, this is a gentle reminder from *${pgName}*. Your rent of *₹${amount}* for *${month}* is currently due. You can pay instantly online via UPI/Card here: https://pg-managementf.netlify.app/tenant/payments . Thank you!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    showSuccess(`Opening WhatsApp for ${record.tenant_name}`);
  };

  const remindAllOverdue = () => {
    const overdueList = records.filter(
      (r) => Number(r.pending_amount || 0) > 0 && (r.status === 'overdue' || r.status === 'pending')
    );
    if (overdueList.length === 0) {
      showInfo('No pending or overdue residents for this month.');
      return;
    }
    // Trigger reminder for the first and inform user
    sendWhatsAppReminder(overdueList[0]);
    if (overdueList.length > 1) {
      showInfo(`Opened reminder for ${overdueList[0].tenant_name}. You have ${overdueList.length - 1} more overdue tenant(s).`);
    }
  };

  const exportToCSV = () => {
    if (records.length === 0) {
      showError('No records to export.');
      return;
    }
    const headers = ['Tenant Name', 'Phone', 'Floor', 'Room', 'Bed', 'Billing Month', 'Total Amount', 'Paid Amount', 'Pending Dues', 'Due Date', 'Status'];
    const rows = records.map((r) => [
      `"${r.tenant_name || ''}"`,
      `"${r.tenant_phone || ''}"`,
      r.floor_number || '1',
      r.room_number || '',
      r.bed_number || '',
      r.month_year || selectedMonth,
      r.total_amount || 0,
      r.paid_amount || 0,
      r.pending_amount || 0,
      r.due_date || '',
      r.status || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Royal_Orchid_Rent_Ledger_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess(`Downloaded Rent Ledger for ${selectedMonth}`);
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

  const viewReceipt = async (record) => {
    try {
      // Find receipt by payment history or record
      const payRes = await api.get(`/payments/history?tenant_id=${record.tenant_id}&limit=1`);
      if (payRes.success && payRes.payments && payRes.payments.length > 0) {
        const latest = payRes.payments[0];
        setReceiptData({
          receipt_number: latest.receipt_no || `REC-${record.month_year.replace('-', '')}-${record.id.slice(-4)}`,
          tenant_name: record.tenant_name,
          month_year: record.month_year,
          amount: latest.amount || record.paid_amount || record.total_amount,
          created_at: latest.payment_date || new Date().toISOString(),
          payment_method: latest.payment_method || 'Online / Cash'
        });
        setReceiptModalOpen(true);
      } else {
        // Fallback receipt from rent record
        setReceiptData({
          receipt_number: `REC-${record.month_year.replace('-', '')}-${record.id.slice(-4)}`,
          tenant_name: record.tenant_name,
          month_year: record.month_year,
          amount: record.paid_amount || record.total_amount,
          created_at: new Date().toISOString(),
          payment_method: 'Cleared'
        });
        setReceiptModalOpen(true);
      }
    } catch (err) {
      showError('Failed to fetch digital receipt');
    }
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;
  const todayStr = new Date().toISOString().slice(0, 10);

  const formattedMonthTitle = new Date(`${selectedMonth}-01`).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header with Quick Month Navigator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Rent Ledger & Dues
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking billing, dues, and payment clearances for <strong className="text-indigo-300">{formattedMonthTitle}</strong>.
          </p>
        </div>

        {/* Action Controls & Month Navigator */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Stepper */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1 shadow-inner">
            <button
              onClick={() => changeMonth(-1)}
              title="Previous Month"
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-black text-white tracking-tight min-w-[110px] text-center">
              {formattedMonthTitle}
            </span>

            <button
              onClick={() => changeMonth(1)}
              title="Next Month"
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick This Month Button */}
          {!isCurrentMonth && (
            <button
              onClick={() => setSelectedMonth(new Date().toISOString().slice(0, 7))}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition"
            >
              This Month
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            title="Download CSV Ledger"
            className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Generate Bills */}
          <button
            onClick={handleGenerateBills}
            disabled={submitting}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Bills</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Rent</span>
          <span className="text-lg sm:text-xl font-black text-white">{formatCurrency(stats?.expected_rent)}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{stats?.total_tenants_billed || 0} Tenants Billed</span>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Collected Rent</span>
          <span className="text-lg sm:text-xl font-black text-emerald-400">{formatCurrency(stats?.collected_rent)}</span>
          <span className="text-[10px] text-emerald-300/80 block mt-0.5">
            {Math.round(Number(stats?.collection_rate) || 0)}% Cleared
          </span>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Due Today ⚡</span>
          <span className="text-lg sm:text-xl font-black text-amber-300">{formatCurrency(stats?.due_today_amount)}</span>
          <span className="text-[10px] text-amber-300/80 block mt-0.5">{stats?.due_today_count || 0} Tenants Due</span>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Pending Dues</span>
          <span className="text-lg sm:text-xl font-black text-amber-400">{formatCurrency(stats?.pending_rent)}</span>
          <span className="text-[10px] text-amber-300/80 block mt-0.5">{stats?.pending_count || 0} Pending Bills</span>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-rose-400 block">Overdue Amount</span>
          <span className="text-lg sm:text-xl font-black text-rose-400">{formatCurrency(stats?.overdue_rent)}</span>
          <span className="text-[10px] text-rose-300/80 block mt-0.5">{stats?.overdue_count || 0} Overdue Bills</span>
        </div>
      </div>

      {/* FILTER TABS WITH LIVE COUNTS & BULK ACTIONS */}
      <div className="bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        {/* Scrollable Status Tabs with accurate count pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Bills', count: stats?.total_tenants_billed || records.length || 0 },
            { id: 'due_today', label: 'Due Today', count: stats?.due_today_count || 0, alert: (stats?.due_today_count || 0) > 0 },
            { id: 'overdue', label: 'Overdue', count: stats?.overdue_count || 0, danger: (stats?.overdue_count || 0) > 0 },
            { id: 'pending', label: 'Pending', count: stats?.pending_count || 0 },
            { id: 'verification_pending', label: 'Verification Pending', count: stats?.verification_pending_count || 0, warn: (stats?.verification_pending_count || 0) > 0 },
            { id: 'paid', label: 'Paid', count: stats?.paid_count || 0 }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                statusFilter === pill.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  statusFilter === pill.id
                    ? 'bg-white/20 text-white'
                    : pill.danger
                    ? 'bg-rose-500/20 text-rose-300'
                    : pill.alert || pill.warn
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input & Bulk Reminder button */}
        <div className="flex items-center gap-2">
          {(stats?.overdue_count > 0 || stats?.due_today_count > 0) && (
            <button
              onClick={remindAllOverdue}
              className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              title="Send WhatsApp Nudge to Overdue Residents"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nudge Overdue</span>
            </button>
          )}

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search resident, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
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
              : statusFilter === 'paid'
              ? `No residents have completed payment yet for ${formattedMonthTitle}.`
              : `No rent bills match the selected filter for ${formattedMonthTitle}.`
          }
          actionText={statusFilter === 'all' ? 'Generate Monthly Bills' : undefined}
          onAction={statusFilter === 'all' ? handleGenerateBills : undefined}
        />
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-800/80">
            {records.map((r) => {
              const isPaid = Number(r.pending_amount || 0) <= 0 || r.status === 'paid';
              const isDueToday = !isPaid && String(r.due_date).slice(0, 10) === todayStr;
              const isOverdue = !isPaid && (r.status === 'overdue' || String(r.due_date).slice(0, 10) < todayStr);

              return (
                <div
                  key={r.id}
                  className={`p-4 space-y-3 ${
                    isDueToday
                      ? 'bg-amber-950/25 border-l-4 border-amber-500'
                      : isOverdue
                      ? 'bg-rose-950/20 border-l-4 border-rose-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
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
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{r.tenant_name}</p>
                        <p className="text-[11px] text-indigo-300 truncate">
                          Room {r.room_number || '—'} &bull; {r.bed_number || '—'} (Floor {r.floor_number || 1})
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

                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total</span>
                      <span className="font-bold text-white">{formatCurrency(r.total_amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Paid</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(r.paid_amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Due</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-400' : isPaid ? 'text-slate-500' : 'text-amber-400'}`}>
                        {formatCurrency(r.pending_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Mobile */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Due: {new Date(r.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>

                    {isPaid ? (
                      <button
                        onClick={() => viewReceipt(r)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Receipt className="w-3.5 h-3.5 text-teal-400" />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => sendWhatsAppReminder(r)}
                          className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openRecordPayment(r)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                        >
                          Collect Pay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Tenant & Unit</th>
                  <th className="py-4 px-4">Billing Month</th>
                  <th className="py-4 px-4">Total Rent</th>
                  <th className="py-4 px-4">Paid Amount</th>
                  <th className="py-4 px-4">Pending Dues</th>
                  <th className="py-4 px-4">Due Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
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
                              Floor {r.floor_number || 1} &bull; Room {r.room_number || '—'} &bull; {r.bed_number}
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
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md active:scale-95"
                            >
                              Collect Pay
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => viewReceipt(r)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700/80 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Receipt className="w-3.5 h-3.5 text-teal-400" />
                              <span>Receipt</span>
                            </button>
                            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Cleared</span>
                            </span>
                          </div>
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
                <span className="text-emerald-300 font-bold">Amount Cleared:</span>
                <span className="text-xl font-extrabold text-emerald-400">{formatCurrency(receiptData.amount)}</span>
              </div>

              <div className="text-[11px] text-slate-400">
                Payment Channel: <strong className="text-slate-200">{receiptData.payment_method}</strong>
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

export default RentManagement;
