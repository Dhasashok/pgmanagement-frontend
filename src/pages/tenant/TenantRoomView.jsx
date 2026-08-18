import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  BedDouble,
  Wifi,
  Wind,
  CheckCircle2,
  Phone,
  Shield,
  Briefcase,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const getInitials = (name) => {
  if (!name) return 'TN';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatSharing = (type) => {
  if (!type) return 'Sharing Room';
  const clean = String(type).toLowerCase().replace(/_/g, ' ');
  if (clean.includes('single') || clean.includes('1')) return '1-Sharing';
  if (clean.includes('double') || clean.includes('two') || clean.includes('2')) return '2-Sharing';
  if (clean.includes('triple') || clean.includes('three') || clean.includes('3')) return '3-Sharing';
  if (clean.includes('four') || clean.includes('4')) return '4-Sharing';
  if (clean.includes('five') || clean.includes('5')) return '5-Sharing';
  if (clean.includes('six') || clean.includes('6')) return '6-Sharing';
  if (clean.includes('seven') || clean.includes('7')) return '7-Sharing';
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
};

export const TenantRoomView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      if (meRes.success && meRes.user?.tenant) {
        const fullRes = await api.get(`/tenants/${meRes.user.tenant.id}`);
        if (fullRes.success) setProfile(fullRes.tenant);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading room information..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Home className="w-6 h-6 text-indigo-400" />
            <span>My Room & Bed</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Room details, Wi-Fi credentials, and amenities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 bg-indigo-950/80 border border-indigo-500/30 rounded-2xl">
          <BedDouble className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-[10px] text-indigo-300 font-bold uppercase block">Your Assigned Bed</span>
            <span className="text-sm font-extrabold text-white">{profile?.bed_number || 'BED 01'}</span>
          </div>
        </div>
      </div>

      {/* Room Details Card */}
      <div className="bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">Assigned Suite</span>
            <h2 className="text-2xl font-extrabold text-white">
              Floor {profile?.floor_number || 1} • Room {profile?.room_number || '101'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Type: {formatSharing(profile?.room_type)} • Monthly Rent: ₹{Number(profile?.monthly_rent || 6000).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Stay
            </span>
          </div>
        </div>

        {/* Personal Stay Credentials & Access Pass (Clean 2-Column Layout) */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Room Access & Credentials</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              ● Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Bed & Locker */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
                <BedDouble className="w-4 h-4" />
                <span className="font-bold text-xs text-slate-200">Allocated Bed & Locker</span>
              </div>
              <p className="font-extrabold text-white text-base">{profile?.bed_number || 'BED 01'}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Wardrobe Locker #{profile?.room_number || '101'}-{(profile?.bed_number || 'B1').slice(-2)}
              </p>
            </div>

            {/* High Speed Wi-Fi Credentials */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
                <Wifi className="w-4 h-4" />
                <span className="font-bold text-xs text-slate-200">High-Speed Wi-Fi</span>
              </div>
              <p className="font-extrabold text-white text-xs font-mono">SSID: RoyalOrchid_5G</p>
              <p className="text-[11px] text-emerald-300 font-mono mt-1 select-all font-semibold">
                Password: OrchidFiber@2026
              </p>
            </div>
          </div>
        </div>

        {/* Included Room Amenities */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Included Room Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Attached Bathroom</span>
                <span className="text-[10px] text-slate-400">Western + Hot Geyser</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <Wifi className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Dedicated Fiber</span>
                <span className="text-[10px] text-slate-400">1 Gbps High Speed</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <Wind className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Ventilation</span>
                <span className="text-[10px] text-slate-400">Balcony & Fans</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Lockable Wardrobe</span>
                <span className="text-[10px] text-slate-400">Personal Storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Roommates Directory */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Roommates in Room {profile?.room_number || '101'}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {profile?.roommates?.length || 0} other {profile?.roommates?.length === 1 ? 'roommate' : 'roommates'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!profile?.roommates || profile.roommates.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 col-span-2 text-center">
                No other roommates currently assigned in this room.
              </p>
            ) : (
              profile.roommates.map((rm) => (
                <div
                  key={rm.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {rm.profile_photo_url ? (
                      <img
                        src={rm.profile_photo_url}
                        alt={rm.full_name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(rm.full_name)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-xs">{rm.full_name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        {rm.occupation_type === 'working' ? (
                          <Briefcase className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <GraduationCap className="w-3 h-3 text-blue-400" />
                        )}
                        <span>{rm.company_name || rm.college_name || 'Working'}</span>
                      </p>
                      <a
                        href={`tel:${rm.mobile_number}`}
                        className="text-[10px] text-indigo-300 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Phone className="w-3 h-3 text-indigo-400" />
                        <span>{rm.mobile_number}</span>
                      </a>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold font-mono">
                    {rm.bed_number}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
