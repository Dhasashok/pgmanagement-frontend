import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Paperclip,
  Image as ImageIcon,
  X,
  Check,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import api, { API_BASE } from '../../services/api';

const getAssetUrl = (url) => {
  if (!url || url.startsWith('http')) return url;
  return `${API_BASE.replace(/\/api$/, '')}${url}`;
};

export const TenantComplaints = () => {
  const { showSuccess, showError } = useNotification();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('wifi');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('File size exceeds 5MB limit.');
        return;
      }
      setAttachment(file);
      if (file.type.startsWith('image/')) {
        setAttachmentPreview(URL.createObjectURL(file));
      } else {
        setAttachmentPreview('');
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (attachment) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('category', category);
        formData.append('description', description.trim());
        formData.append('image', attachment);

        const res = await api.post('/complaints', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.success) {
          showSuccess('Maintenance ticket with attachment submitted!');
          setModalOpen(false);
          setTitle('');
          setDescription('');
          removeAttachment();
          await fetchComplaints();
        }
      } else {
        const res = await api.post('/complaints', { title: title.trim(), category, description: description.trim() });
        if (res.success) {
          showSuccess('Maintenance ticket submitted! Staff will attend shortly.');
          setModalOpen(false);
          setTitle('');
          setDescription('');
          await fetchComplaints();
        }
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
            <Wrench className="w-6 h-6 text-teal-400" />
            <span>Maintenance & Service Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit service tickets with photos for fast on-site repair and track live progress.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          data-testid="raise-complaint-btn"
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
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
          description="All systems normal. You have no pending maintenance requests."
          actionText="Raise Request"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const isResolved = c.status === 'resolved' || c.status === 'closed';
            const isInProgress = c.status === 'in_progress' || isResolved;
            const isSubmitted = true;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl"
              >
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        • {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">{c.title}</h3>
                  </div>

                  <Badge variant={isResolved ? 'paid' : isInProgress && c.status === 'in_progress' ? 'verification_pending' : 'danger'}>
                    {c.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Live Progress Timeline / Tracker UI */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3" data-testid="complaint-progress-tracker">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">Live Resolution Timeline</span>
                    <span className="text-teal-400">{isResolved ? '100% Completed' : c.status === 'in_progress' ? '50% In Progress' : '25% Awaiting Staff'}</span>
                  </div>

                  {/* Progress Bar Line */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isResolved
                          ? 'w-full bg-emerald-400'
                          : c.status === 'in_progress'
                          ? 'w-1/2 bg-teal-400'
                          : 'w-1/4 bg-indigo-500'
                      }`}
                    />
                  </div>

                  {/* 3-Step Milestones */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSubmitted ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">Submitted</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isInProgress ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isInProgress ? <Check className="w-3.5 h-3.5" /> : '2'}
                      </div>
                      <span className={`text-[10px] font-bold ${isInProgress ? 'text-teal-300' : 'text-slate-500'}`}>
                        In Progress
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isResolved ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isResolved ? <Check className="w-3.5 h-3.5" /> : '3'}
                      </div>
                      <span className={`text-[10px] font-bold ${isResolved ? 'text-emerald-400' : 'text-slate-500'}`}>
                        Resolved
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 leading-relaxed">
                  {c.description}
                </p>

                {/* Attachment Thumbnail if available */}
                {c.image_url && (
                  <div className="flex items-center gap-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <img
                      src={getAssetUrl(c.image_url)}
                      alt="Complaint attachment"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-300 block">Uploaded Attachment</span>
                      <a
                        href={getAssetUrl(c.image_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        View Full Photo
                      </a>
                    </div>
                  </div>
                )}

                {c.resolution_notes && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                    <strong>Resolution Update from Warden: </strong>{c.resolution_notes}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: New Complaint */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Raise Maintenance Request"
        subtitle="Our facility team will inspect and resolve the issue."
      >
        <form onSubmit={handleCreate} className="space-y-4" data-testid="complaint-form">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
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
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Problem Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe when the issue started and any specific details..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Optional Attachment File Upload Control */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional Attachment / Photo (Image/PNG/JPG max 5MB)
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="file"
                id="attachment"
                name="attachment"
                data-testid="complaint-attachment-input"
                ref={fileInputRef}
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-teal-300 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            {attachmentPreview && (
              <div className="mt-2.5 relative inline-block">
                <img
                  src={attachmentPreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-xl border border-teal-500/40 shadow-md"
                />
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-500"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
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
              data-testid="submit-complaint-submit-btn"
              className="px-5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg disabled:opacity-50 flex items-center gap-1.5"
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

export default TenantComplaints;
