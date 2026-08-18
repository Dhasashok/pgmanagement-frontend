import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  Send,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

export const AnnouncementsManager = () => {
  const { showSuccess, showError } = useNotification();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.success) {
        setAnnouncements(res.announcements || []);
      }
    } catch (err) {
      showError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/announcements', { title, message, category, priority });
      if (res.success) {
        showSuccess('Announcement broadcasted to all residents successfully!');
        setModalOpen(false);
        setTitle('');
        setMessage('');
        await fetchAnnouncements();
      }
    } catch (err) {
      showError(err.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      showSuccess('Announcement removed');
      await fetchAnnouncements();
    } catch (err) {
      showError(err.message || 'Failed to delete');
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'medium': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-indigo-400" />
            <span>PG Notice Board & Announcements</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast official notices, water/electricity maintenance schedules, and rules to all residents.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <LoadingSpinner label="Loading announcements..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No Active Announcements"
          description="Click 'Publish Notice' above to send your first broadcast to all active residents."
          actionText="Publish Notice"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((anc) => (
            <motion.div
              key={anc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(anc.priority)}`}>
                      {anc.priority}
                    </span>
                    <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                      • {anc.category}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{anc.title}</h3>
                </div>

                <button
                  onClick={() => handleDelete(anc.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition opacity-0 group-hover:opacity-100"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                {anc.message}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Published by {anc.author_name || 'Management'}</span>
                <span>{new Date(anc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Publish Notice */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish New PG Announcement"
        subtitle="This notice will appear on all resident dashboards and trigger in-app alerts."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water Tank Sanitization on Sunday"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="general">General Notice</option>
                <option value="maintenance">Facility Maintenance</option>
                <option value="event">PG Event / Festival</option>
                <option value="rules">PG Rules & Security</option>
                <option value="emergency">Emergency Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Message *</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide complete details, timings, and instructions for residents..."
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
              <span>{submitting ? 'Publishing...' : 'Broadcast Notice'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
