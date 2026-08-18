import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  Wrench,
  Wifi,
  Droplets,
  Zap,
  Sparkles,
  Search,
  MessageSquare,
  Building,
  User
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

export const ComplaintsManager = () => {
  const { showSuccess, showError } = useNotification();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Resolution Modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints?status=${statusFilter}&category=${categoryFilter}`);
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      showError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const openStatusUpdate = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status === 'pending' ? 'in_progress' : 'resolved');
    setResolutionNotes(complaint.resolution_notes || '');
    setResolveModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      const res = await api.put(`/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        resolution_notes: resolutionNotes
      });
      if (res.success) {
        showSuccess(`Ticket updated to ${newStatus.toUpperCase()}! Resident notified.`);
        setResolveModalOpen(false);
        await fetchComplaints();
      }
    } catch (err) {
      showError(err.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'wifi': return <Wifi className="w-4 h-4 text-indigo-400" />;
      case 'water':
      case 'plumbing': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'electricity':
      case 'light':
      case 'fan': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'cleaning': return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default: return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-indigo-400" />
            <span>Maintenance Tickets & Resident Complaints</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review resident service requests, update maintenance progress, and broadcast resolution status.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Tickets' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                statusFilter === st.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          <option value="electricity">Electricity / Power</option>
          <option value="water">Water / Geyser</option>
          <option value="wifi">Wi-Fi / Internet</option>
          <option value="cleaning">Room & Balcony Cleaning</option>
          <option value="plumbing">Plumbing</option>
          <option value="fan">Fan / AC</option>
          <option value="light">Lighting</option>
          <option value="other">Other Requests</option>
        </select>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <LoadingSpinner label="Fetching maintenance tickets..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          celebratory={true}
          title="🎉 All Caught Up!"
          description={
            statusFilter === 'pending'
              ? 'Zero pending complaints! All resident maintenance tasks are resolved.'
              : 'No maintenance requests found in this view.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((c) => {
            const isPending = c.status === 'pending';
            const isInProgress = c.status === 'in_progress';
            const isResolved = c.status === 'resolved';

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-6 rounded-3xl border transition-all duration-300 space-y-4 ${
                  isPending
                    ? 'border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/10'
                    : isInProgress
                    ? 'border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/10'
                    : 'border-slate-800'
                }`}
              >
                {/* Top Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60">
                      {getCategoryIcon(c.category)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                        {c.category}
                      </span>
                      <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    </div>
                  </div>

                  <Badge variant={c.status === 'resolved' ? 'paid' : c.status === 'in_progress' ? 'verification_pending' : 'danger'}>
                    {c.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
                  {c.description}
                </p>

                {/* Resident Details */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-white">{c.tenant_name}</span>
                    <span>•</span>
                    <span className="text-indigo-300">Room {c.room_number || '101'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Resolution Notes if any */}
                {c.resolution_notes && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-200">
                    <strong>Resolution Note: </strong>{c.resolution_notes}
                  </div>
                )}

                {/* Status Action Button */}
                {!isResolved && (
                  <div className="pt-2">
                    <button
                      onClick={() => openStatusUpdate(c)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition shadow-md ${
                        isPending
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isPending ? 'Mark as In Progress' : 'Resolve Ticket'}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Update Ticket Status */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Update Maintenance Ticket"
        subtitle={`Ticket: ${selectedComplaint?.title} (${selectedComplaint?.category})`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status Transition</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress (Electrician / Plumber Assigned)</option>
              <option value="resolved">Resolved (Work Completed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Comments for Resident</label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Electrician visited and repaired the switch board."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Save & Notify Resident'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
