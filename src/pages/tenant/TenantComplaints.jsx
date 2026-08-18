import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Droplets,
  Zap,
  Sparkles,
  Send,
  Upload
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

export const TenantComplaints = () => {
  const { showSuccess, showError } = useNotification();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('wifi');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      showError('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/complaints', { title, category, description });
      if (res.success) {
        showSuccess('Maintenance ticket submitted! Staff will attend shortly.');
        setModalOpen(false);
        setTitle('');
        setDescription('');
        await fetchComplaints();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-indigo-400" />
            <span>Maintenance Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit service requests for quick assistance.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Request</span>
        </button>
      </div>

      {/* Tickets List */}
      {loading ? (
        <LoadingSpinner label="Loading tickets..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Active Requests"
          description="No open maintenance requests."
          actionText="Raise Request"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      [{c.category}]
                    </span>
                    <span className="text-[10px] text-slate-500">
                      • {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{c.title}</h3>
                </div>

                <Badge variant={c.status === 'resolved' ? 'paid' : c.status === 'in_progress' ? 'verification_pending' : 'danger'}>
                  {c.status.replace('_', ' ')}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                {c.description}
              </p>

              {c.resolution_notes && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                  <strong>Resolution Update: </strong>{c.resolution_notes}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: New Complaint */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Raise Maintenance Request"
        subtitle="Our facility manager will inspect and resolve the issue."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="wifi">Wi-Fi & Internet</option>
              <option value="electricity">Electricity / Power Outage</option>
              <option value="water">Water / Geyser</option>
              <option value="cleaning">Room & Balcony Cleaning</option>
              <option value="plumbing">Plumbing & Tap Leaks</option>
              <option value="fan">Fan / AC</option>
              <option value="light">Lighting / Tube Light</option>
              <option value="other">Other Facility Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Summary *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi router disconnection in Room 101"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Problem Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe when the issue started and any specific details..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
