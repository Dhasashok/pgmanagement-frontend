import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  X,
  AlertCircle,
  FileImage,
  User,
  Building
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import api, { API_BASE } from '../../services/api';

export const PaymentVerification = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [proofs, setProofs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'auto_verified', 'approved', 'rejected', 'all', 'audit_logs'

  // Review Modals
  const [previewProof, setPreviewProof] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProofForReject, setSelectedProofForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchProofs = async () => {
    try {
      setLoading(true);
      if (statusFilter === 'audit_logs') {
        const auditRes = await api.get('/payments/audit-logs');
        if (auditRes.success) {
          setAuditLogs(auditRes.logs || []);
        }
      } else {
        const res = await api.get(`/payments/proofs?status=${statusFilter}`);
        if (res.success) {
          setProofs(res.proofs || []);
        }
      }
    } catch (err) {
      showError('Failed to fetch verification requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, [statusFilter]);

  const handleApprove = async (proofId) => {
    setProcessing(true);
    try {
      const res = await api.post(`/payments/proofs/${proofId}/verify`, {
        action: 'approve'
      });
      if (res.success) {
        showSuccess(`Payment proof approved! Receipt No: ${res.receiptNo}`);
        setPreviewProof(null);
        await fetchProofs();
      }
    } catch (err) {
      showError(err.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (proof) => {
    setSelectedProofForReject(proof);
    setRejectionReason('Transaction ID or screenshot does not match bank deposit records.');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedProofForReject) return;
    setProcessing(true);
    try {
      const res = await api.post(`/payments/proofs/${selectedProofForReject.id}/verify`, {
        action: 'reject',
        rejection_reason: rejectionReason
      });
      if (res.success) {
        showSuccess('Payment proof rejected and marked in resident portal.');
        setRejectModalOpen(false);
        setPreviewProof(null);
        await fetchProofs();
      }
    } catch (err) {
      showError(err.message || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE.replace('/api', '')}${url}`;
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>Payment Verification</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and verify offline UPI and bank payment receipts.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'auto_verified', label: 'Auto-Verified' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'audit_logs', label: 'Audit Logs' },
            { id: 'all', label: 'All Proofs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main View: Audit Logs or Proof Cards */}
      {statusFilter === 'audit_logs' ? (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verification Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-400">{auditLogs.length} Records Logged</span>
          </div>

          {loading ? (
            <LoadingSpinner label="Fetching audit logs..." />
          ) : auditLogs.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No Audit Logs Yet"
              description="Audit events will be logged here as receipts are processed."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Resident</th>
                    <th className="py-3.5 px-4">UTR Reference</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Level 1 Validation</th>
                    <th className="py-3.5 px-4">Level 2 Provider</th>
                    <th className="py-3.5 px-4">Final Decision</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {log.tenant_name || 'Resident'}
                        <span className="block text-[10px] text-slate-400 font-normal">{log.month_year || 'Rent'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-300 font-bold">
                        {log.transaction_ref}
                      </td>
                      <td className="py-3 px-4 font-black text-white">
                        {formatCurrency(log.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                          {log.validation_status || 'Passed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.matched_provider || 'UPI Provider'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={log.action === 'approved' ? 'paid' : log.action === 'rejected' ? 'overdue' : 'pending'}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Proofs Queue */
        loading ? (
          <LoadingSpinner label="Fetching verification queue..." />
        ) : proofs.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            celebratory={true}
            title="No Pending Payments"
            description={
              statusFilter === 'pending'
                ? 'All offline payment receipts have been verified.'
                : 'No payment proofs found in this view.'
            }
          />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proofs.map((proof) => {
            const isPending = proof.status === 'pending';

            return (
              <motion.div
                key={proof.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-6 rounded-3xl border transition-all duration-300 space-y-4 ${
                  isPending
                    ? 'border-purple-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 shadow-xl'
                    : 'border-slate-800'
                }`}
              >
                {/* Top: Resident & Billing Month */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{proof.tenant_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-purple-300 font-semibold">
                          Floor {proof.floor_number || 1} • Room {proof.room_number || '101'} • {proof.bed_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={proof.status}>{proof.status}</Badge>
                </div>

                {/* Amount & Transaction ID Box */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Claimed Amount</span>
                    <span className="text-xl font-black text-emerald-400">{formatCurrency(proof.amount)}</span>
                    <span className="text-[10px] text-slate-500 block">For {proof.month_year} Rent</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Transaction Ref / UTR</span>
                    <span className="text-xs font-mono font-bold text-indigo-300 block truncate">{proof.transaction_ref}</span>
                    <span className="text-[10px] text-slate-500 block">Submitted: {new Date(proof.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Notes from Tenant */}
                {proof.notes && (
                  <p className="text-xs text-slate-300 p-3 bg-slate-800/40 rounded-xl italic">
                    "{proof.notes}"
                  </p>
                )}

                {/* Rejection Reason if Rejected */}
                {proof.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs">
                    <span className="font-bold text-rose-400 block mb-0.5">Outcome: Rejected</span>
                    <p className="text-slate-300 italic">"{proof.rejection_reason}"</p>
                  </div>
                )}

                {/* Proof Image Attachment Preview */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Payment Proof Document</span>
                  <div
                    onClick={() => setPreviewProof(proof)}
                    className="h-36 w-full rounded-2xl overflow-hidden border border-slate-700/80 relative cursor-pointer group bg-slate-950 flex items-center justify-center"
                  >
                    <img
                      src={getImageUrl(proof.proof_image_url)}
                      alt="Proof Receipt"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-sm">
                      <ExternalLink className="w-4 h-4" />
                      <span>Inspect Full Size</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                {isPending && (
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(proof.id)}
                      disabled={processing}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Clear Rent</span>
                    </button>

                    <button
                      onClick={() => openRejectModal(proof)}
                      disabled={processing}
                      className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ))}

      {/* Modal: Full Image Inspection */}
      <Modal
        isOpen={!!previewProof}
        onClose={() => setPreviewProof(null)}
        title={`Payment Receipt: ${previewProof?.tenant_name}`}
        subtitle={`Amount: ₹${previewProof?.amount} • UTR: ${previewProof?.transaction_ref}`}
        maxWidth="max-w-2xl"
      >
        {previewProof && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[500px] flex items-center justify-center">
              <img
                src={getImageUrl(previewProof.proof_image_url)}
                alt="Receipt Inspection"
                className="max-w-full max-h-[480px] object-contain"
              />
            </div>

            {previewProof.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => openRejectModal(previewProof)}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition"
                >
                  Reject Proof
                </button>
                <button
                  onClick={() => handleApprove(previewProof.id)}
                  disabled={processing}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
                >
                  Approve Payment
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Reject Proof with Reason */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Payment Proof"
        subtitle={`Tenant ${selectedProofForReject?.tenant_name} will be notified with this reason.`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Rejection</label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. UTR number not reflected in bank account statement / Unclear screenshot."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
