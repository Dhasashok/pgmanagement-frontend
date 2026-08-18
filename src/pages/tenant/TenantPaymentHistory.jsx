import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Receipt,
  Download,
  Printer,
  CheckCircle,
  Building,
  Calendar,
  CreditCard,
  User
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';

export const TenantPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Digital Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/history');
      if (res.success) {
        setPayments(res.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openReceipt = async (receiptNo) => {
    try {
      const res = await api.get(`/payments/receipt/${receiptNo}`);
      if (res.success) {
        setActiveReceipt(res.receipt);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <History className="w-6 h-6 text-indigo-400" />
          <span>Payment History & Digital Receipts</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Access your official rent invoices, transaction IDs, and cleared payment receipts.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching your payment archive..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Past Payments Found"
          description="Your payment history and invoices will be listed here after you clear your rent."
        />
      ) : (
        <div className="space-y-4">
          {payments.map((pay) => (
            <motion.div
              key={pay.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">
                      {pay.month_year ? `${pay.month_year} Rent Payment` : 'Rent Payment'}
                    </h3>
                    <Badge variant="paid">Cleared</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Receipt: <span className="font-mono text-indigo-300 font-bold">{pay.receipt_no}</span> • Method: <span className="uppercase text-white font-semibold">{pay.payment_method.replace('_', ' ')}</span>
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Date: {new Date(pay.payment_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(pay.payment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-left sm:text-right">
                  <span className="text-xl font-black text-emerald-400 block">{formatCurrency(pay.amount)}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">TxID: {pay.transaction_id || 'N/A'}</span>
                </div>

                <button
                  onClick={() => openReceipt(pay.receipt_no)}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Digital Invoice</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Formatted Digital Receipt */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official Digital Invoice & Receipt"
        subtitle="Issued by Royal Orchid PG Management"
        maxWidth="max-w-xl"
      >
        {activeReceipt && (
          <div className="space-y-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-200 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">{activeReceipt.pg_name || 'Royal Orchid PG'}</h3>
                <p className="text-[11px] text-slate-400">{activeReceipt.pg_address || 'Silicon Valley Tech Zone, Bengaluru'}</p>
                <p className="text-[11px] text-indigo-400">Phone: {activeReceipt.pg_phone || '+91 98765 43210'}</p>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold text-[10px] uppercase">
                  Payment Cleared
                </span>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">Invoice #{activeReceipt.receipt_no}</p>
              </div>
            </div>

            {/* Tenant & Room details */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Billed To</span>
                <p className="font-bold text-white text-sm">{activeReceipt.tenant_name}</p>
                <p className="text-slate-400">{activeReceipt.tenant_phone}</p>
                <p className="text-slate-500 text-[10px] truncate">{activeReceipt.tenant_address}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Stay Location</span>
                <p className="font-bold text-white text-sm">Floor {activeReceipt.floor_number} • Room {activeReceipt.room_number}</p>
                <p className="text-indigo-400 font-semibold">{activeReceipt.bed_number}</p>
                <p className="text-slate-400">Month: {activeReceipt.month_year}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between text-slate-400 font-bold text-[10px] uppercase">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex items-center justify-between text-white font-medium">
                <span>Room Tariff & Accommodation ({activeReceipt.month_year})</span>
                <span>{formatCurrency(activeReceipt.rent_amount || activeReceipt.amount)}</span>
              </div>
              {activeReceipt.maintenance_charges > 0 && (
                <div className="flex items-center justify-between text-white font-medium">
                  <span>Maintenance & High-Speed Fiber Utilities</span>
                  <span>{formatCurrency(activeReceipt.maintenance_charges)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Method</span>
                <span className="font-bold text-white uppercase">{activeReceipt.payment_method?.replace('_', ' ')}</span>
                <span className="text-[10px] text-slate-500 block font-mono">TxID: {activeReceipt.transaction_id}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid (INR)</span>
                <span className="text-2xl font-black text-emerald-400">{formatCurrency(activeReceipt.amount)}</span>
              </div>
            </div>

            {/* Print Action */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
