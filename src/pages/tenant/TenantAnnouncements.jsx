import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Calendar, Tag } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';

export const TenantAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await api.get('/announcements');
        if (res.success) setAnnouncements(res.announcements || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

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
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Megaphone className="w-6 h-6 text-indigo-400" />
          <span>PG Notice Board & Announcements</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Stay updated with maintenance schedules, events, and important rules from PG management.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading announcements..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No Notices Available"
          description="There are currently no active announcements from management."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((anc) => (
            <motion.div
              key={anc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/30 space-y-3 transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(anc.priority)}`}>
                  {anc.priority}
                </span>
                <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                  • {anc.category}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">{anc.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                {anc.message}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>By {anc.author_name || 'Management'}</span>
                <span>{new Date(anc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
