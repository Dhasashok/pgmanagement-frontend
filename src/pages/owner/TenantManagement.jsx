import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  User,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Building,
  BedDouble,
  Calendar,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Shield,
  Briefcase,
  GraduationCap,
  LogOut,
  ArrowRightLeft,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import api, { API_BASE } from '../../services/api';

const occupationLabels = {
  student: 'Student',
  working: 'Working Professional',
  self_employed: 'Self-Employed',
  business_owner: 'Business Owner',
  freelancer: 'Freelancer',
  job_seeker: 'Job Seeker',
  other: 'Other'
};

const getAssetUrl = (url) => {
  if (!url || url.startsWith('http')) return url;
  return `${API_BASE.replace(/\/api$/, '')}${url}`;
};

export const TenantManagement = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [occupationFilter, setOccupationFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');

  // Hierarchy for Bed Picker
  const [hierarchy, setHierarchy] = useState([]);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutReason, setCheckoutReason] = useState('');
  const [checkoutDate, setCheckoutDate] = useState(new Date().toISOString().split('T')[0]);

  // Form State for Add Tenant
  const initialFormState = {
    full_name: '',
    mobile_number: '',
    email: '',
    date_of_birth: '2000-01-01',
    gender: 'male',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    relationship_with_emergency_contact: 'Parent',
    occupation_type: 'working',
    college_name: '',
    company_name: '',
    id_proof_type: 'aadhaar',
    id_proof_number: '',
    profile_photo_url: '',
    joining_date: new Date().toISOString().split('T')[0],
    expected_leaving_date: '',
    monthly_rent: 6000,
    security_deposit: 10000,
    rent_due_day: 5,
    bed_id: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        occupation_type: occupationFilter,
        search
      });
      if (floorFilter !== 'all') params.set('floor_id', floorFilter);
      if (roomFilter !== 'all') params.set('room_id', roomFilter);
      const res = await api.get(`/tenants?${params.toString()}`);
      if (res.success) {
        setTenants(res.tenants || []);
      }
    } catch (err) {
      showError('Failed to fetch tenants list');
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const res = await api.get('/pg/hierarchy');
      if (res.success) setHierarchy(res.hierarchy || []);
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [statusFilter, occupationFilter, floorFilter, roomFilter, search]);

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/tenants', formData);
      if (res.success) {
        showSuccess(`Tenant ${formData.full_name} onboarded successfully!`);
        setAddModalOpen(false);
        setFormData(initialFormState);
        await fetchTenants();
      }
    } catch (err) {
      showError(err.message || 'Failed to create tenant');
    } finally {
      setSubmitting(false);
    }
  };

  const openTenantDetail = async (tenantId) => {
    try {
      const res = await api.get(`/tenants/${tenantId}`);
      if (res.success) {
        setSelectedTenant(res.tenant);
        setDetailModalOpen(true);
      }
    } catch (err) {
      showError('Failed to load tenant profile');
    }
  };

  const openEditProfile = () => {
    if (!selectedTenant) return;
    setEditProfile({ ...selectedTenant });
    setEditProfileOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editProfile) return;
    if (!editProfile.full_name?.trim() || !/^\+?[1-9]\d{7,14}$/.test(String(editProfile.mobile_number || '').replace(/[\s()-]/g, ''))) {
      showError('Enter a valid name and mobile number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editProfile.email || '') || !editProfile.permanent_address?.trim()) {
      showError('Enter a valid email address and permanent address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.put(`/tenants/${selectedTenant.id}`, editProfile);
      if (res.success) {
        showSuccess('Resident profile updated successfully.');
        setEditProfileOpen(false);
        await openTenantDetail(selectedTenant.id);
        await fetchTenants();
      }
    } catch (err) {
      showError(err.message || 'Failed to update resident profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedTenant) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/tenants/${selectedTenant.id}/checkout`, {
        reason: checkoutReason,
        leave_date: checkoutDate
      });
      if (res.success) {
        showSuccess('Tenant checked out successfully. Bed is now available.');
        setCheckoutModalOpen(false);
        setDetailModalOpen(false);
        await fetchTenants();
      }
    } catch (err) {
      showError(err.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Get list of all currently available beds for picker
  const availableBeds = [];
  hierarchy.forEach(flr => {
    flr.rooms.forEach(rm => {
      rm.beds.forEach(bd => {
        if (bd.status === 'available') {
          availableBeds.push({
            id: bd.id,
            label: `Floor ${flr.floor_number} • Room ${rm.room_number} (${rm.room_type.replace('_', ' ')}) • ${bd.bed_number} - ₹${bd.monthly_rent}/mo`,
            rent: bd.monthly_rent
          });
        }
      });
    });
  });
  const filterRooms = hierarchy.find((floor) => floor.id === floorFilter)?.rooms || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Residents & Tenant Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete tenant profiles, document proofs, room assignments, and check-in / check-out controls.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Tenant</span>
        </button>
      </div>

      {/* Location-first tenant filters */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <p className="text-xs font-bold text-white">1. Select Floor</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => { setFloorFilter('all'); setRoomFilter('all'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${floorFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >All Floors</button>
            {hierarchy.map((floor) => (
              <button
                key={floor.id}
                onClick={() => { setFloorFilter(floor.id); setRoomFilter('all'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${floorFilter === floor.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >Floor {floor.floor_number}</button>
            ))}
          </div>
        </div>

        {floorFilter !== 'all' && (
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs font-bold text-white">2. Select Room</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => setRoomFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${roomFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>All Rooms</button>
              {filterRooms.map((room) => (
                <button key={room.id} onClick={() => setRoomFilter(room.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${roomFilter === room.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Room {room.room_number}</button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'pre_booked', label: 'Pre-bookings' },
              { id: 'notice_period', label: 'Notice Period' }, { id: 'checked_out', label: 'Checked Out' },
            ].map((pill) => (
              <button key={pill.id} onClick={() => setStatusFilter(pill.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${statusFilter === pill.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{pill.label}</button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={occupationFilter} onChange={(e) => setOccupationFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500">
              <option value="all">All Occupations</option><option value="working">Working Professionals</option><option value="student">Students</option><option value="self_employed">Self-Employed</option><option value="business_owner">Business Owners</option><option value="freelancer">Freelancers</option><option value="job_seeker">Job Seekers</option>
            </select>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-60 pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table / Cards */}
      {loading ? (
        <LoadingSpinner label="Loading tenant records..." />
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Tenants Found"
          description="No resident records matched your filters. Onboard a new tenant to get started."
          actionText="Add New Tenant"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="md:hidden divide-y divide-slate-800/80">
            {tenants.map((t) => (
              <button key={t.id} onClick={() => openTenantDetail(t.id)} className="w-full p-4 text-left hover:bg-slate-800/40 transition">
                <div className="flex items-start gap-3">
                  <img src={getAssetUrl(t.profile_photo_url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} alt={t.full_name} className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><div><p className="font-bold text-white text-sm truncate">{t.full_name}</p><p className="text-[11px] text-slate-400 mt-0.5">{t.mobile_number}</p></div><Badge variant={t.status} size="sm">{t.status}</Badge></div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                      <div><span className="text-slate-500 block">Room & bed</span><span className="font-semibold text-indigo-300">{t.room_number ? `Floor ${t.floor_number} · Room ${t.room_number}` : 'Unassigned'}{t.bed_number ? ` · ${t.bed_number}` : ''}</span></div>
                      <div><span className="text-slate-500 block">Monthly rent</span><span className="font-semibold text-white">₹{Number(t.monthly_rent || 0).toLocaleString('en-IN')}</span></div>
                    </div>
                    <span className="inline-flex mt-3 text-xs font-bold text-indigo-300">View complete profile →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Tenant Profile</th>
                  <th className="py-4 px-4">Room & Bed</th>
                  <th className="py-4 px-4">Occupation</th>
                  <th className="py-4 px-4">Move-in Date</th>
                  <th className="py-4 px-4">Monthly Rent</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {tenants.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => openTenantDetail(t.id)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAssetUrl(t.profile_photo_url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={t.full_name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-white text-sm group-hover:text-indigo-400 transition truncate">
                            {t.full_name}
                          </p>
                          <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                            <span>{t.mobile_number}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {t.room_number ? (
                        <div>
                          <span className="font-bold text-white block">
                            Floor {t.floor_number || 1} • Room {t.room_number}
                          </span>
                          <span className="text-[10px] text-indigo-400 font-semibold">{t.bed_number}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        {t.occupation_type === 'student' ? (
                          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{occupationLabels[t.occupation_type] || 'Other'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                        {t.company_name || t.college_name || 'N/A'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span>{new Date(`${t.joining_date}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {t.status === 'pre_booked' && <span className="text-[10px] text-indigo-300 block mt-0.5">Bed reserved</span>}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-white text-sm">₹{Number(t.monthly_rent).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500 block">Due Day: {t.rent_due_day || 5}th</span>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={t.status} size="sm">{t.status}</Badge>
                    </td>

                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openTenantDetail(t.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold text-slate-300 transition"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Tenant Wizard */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Onboard New Tenant"
        subtitle="Create tenant profile, configure bed assignment, and generate resident credentials."
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreateTenant} className="space-y-6">
          {/* Section 1: Personal Info */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 mb-3 pb-1 border-b border-slate-800">
              1. Personal Identification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Rahul Patil"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Permanent Home Address *</label>
                <input
                  type="text"
                  required
                  value={formData.permanent_address}
                  onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                  placeholder="House #, Street, City, State, PIN"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-3 pb-1 border-b border-slate-800">
              2. Emergency & Guardian Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact Name *</label>
                <input
                  type="text"
                  required
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="Suresh Patil"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.emergency_contact_number}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })}
                  placeholder="+91 98220 99887"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship *</label>
                <input
                  type="text"
                  required
                  value={formData.relationship_with_emergency_contact}
                  onChange={(e) => setFormData({ ...formData, relationship_with_emergency_contact: e.target.value })}
                  placeholder="Father / Mother / Guardian"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Occupation & ID */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-3 pb-1 border-b border-slate-800">
              3. Occupation & Verification ID
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Occupation Type</label>
                <select
                  value={formData.occupation_type}
                  onChange={(e) => setFormData({ ...formData, occupation_type: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="working">Working Professional</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {formData.occupation_type === 'working' ? 'Company Name' : 'College Name'}
                </label>
                <input
                  type="text"
                  value={formData.occupation_type === 'working' ? formData.company_name : formData.college_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_name: formData.occupation_type === 'working' ? e.target.value : '',
                    college_name: formData.occupation_type === 'student' ? e.target.value : ''
                  })}
                  placeholder={formData.occupation_type === 'working' ? 'Infosys / TCS' : 'PES University'}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ID Proof Type</label>
                <select
                  value={formData.id_proof_type}
                  onChange={(e) => setFormData({ ...formData, id_proof_type: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="driving_license">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ID Proof Number</label>
                <input
                  type="text"
                  value={formData.id_proof_number}
                  onChange={(e) => setFormData({ ...formData, id_proof_number: e.target.value })}
                  placeholder="4829-1928-3849"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bed Assignment & Financials */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 mb-3 pb-1 border-b border-slate-800">
              4. Bed Allocation & Rental Terms
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign to Available Bed</label>
                <select
                  value={formData.bed_id}
                  onChange={(e) => {
                    const bId = e.target.value;
                    const match = availableBeds.find(b => b.id === bId);
                    setFormData({
                      ...formData,
                      bed_id: bId,
                      monthly_rent: match ? match.rent : formData.monthly_rent
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Assign Later / No Bed Selected --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Rent (₹)</label>
                <input
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData({ ...formData, monthly_rent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={formData.security_deposit}
                  onChange={(e) => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stay Start Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.joining_date}
                  onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-[10px] text-slate-500">A future date creates a pre-booking and reserves the selected bed.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {submitting ? 'Creating Profile...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Full Tenant Profile Detail */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedTenant?.full_name || 'Resident Details'}
        subtitle={`ID: ${selectedTenant?.id} • Move-in: ${selectedTenant?.joining_date || 'Not set'}`}
        maxWidth="max-w-3xl"
      >
        {selectedTenant && (
          <div className="space-y-6">
            {/* Top Identity Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-4">
                <img
                  src={getAssetUrl(selectedTenant.profile_photo_url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={selectedTenant.full_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-white">{selectedTenant.full_name}</h3>
                    <Badge variant={selectedTenant.status}>{selectedTenant.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="text-indigo-300 font-semibold">{selectedTenant.mobile_number}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={openEditProfile} className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Edit Profile</button>
                {selectedTenant.status === 'active' && (
                  <button onClick={() => setCheckoutModalOpen(true)} className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Check Out Resident</button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <section className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Building className="w-4 h-4" /> Stay & Billing</h5>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div><dt className="text-slate-500">Location</dt><dd className="font-bold text-white mt-0.5">{selectedTenant.room_number ? `Floor ${selectedTenant.floor_number} • Room ${selectedTenant.room_number}` : 'Unassigned'}</dd></div>
                  <div><dt className="text-slate-500">Bed</dt><dd className="font-bold text-indigo-300 mt-0.5">{selectedTenant.bed_number || 'Not assigned'}</dd></div>
                  <div><dt className="text-slate-500">Monthly rent</dt><dd className="font-bold text-emerald-400 mt-0.5">₹{Number(selectedTenant.monthly_rent || 0).toLocaleString('en-IN')}</dd></div>
                  <div><dt className="text-slate-500">Security deposit</dt><dd className="font-bold text-white mt-0.5">₹{Number(selectedTenant.security_deposit || 0).toLocaleString('en-IN')}</dd></div>
                  <div><dt className="text-slate-500">Move-in date</dt><dd className="font-bold text-white mt-0.5">{selectedTenant.joining_date || 'Not set'}</dd></div>
                  <div><dt className="text-slate-500">Rent due</dt><dd className="font-bold text-white mt-0.5">{selectedTenant.rent_due_day ? `${selectedTenant.rent_due_day}th each month` : 'Not set'}</dd></div>
                </dl>
              </section>

              <section className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1.5"><User className="w-4 h-4" /> Personal & Contact</h5>
                <dl className="space-y-3">
                  <div><dt className="text-slate-500">Email</dt><dd className="font-semibold text-white break-all mt-0.5">{selectedTenant.user_email || selectedTenant.email || 'Not provided'}</dd></div>
                  <div><dt className="text-slate-500">Gender</dt><dd className="font-semibold text-white mt-0.5 capitalize">{selectedTenant.gender || 'Not provided'}</dd></div>
                  <div><dt className="text-slate-500">Occupation</dt><dd className="font-semibold text-white mt-0.5">{occupationLabels[selectedTenant.occupation_type] || 'Other'}{selectedTenant.company_name || selectedTenant.college_name ? ` · ${selectedTenant.company_name || selectedTenant.college_name}` : ''}</dd></div>
                  <div><dt className="text-slate-500">Permanent address</dt><dd className="font-semibold text-white leading-relaxed mt-0.5">{selectedTenant.permanent_address || 'Not provided'}</dd></div>
                </dl>
              </section>
            </div>

            <section className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Shield className="w-4 h-4" /> Emergency Contact</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"><div><span className="text-slate-400 block">Name & relation</span><span className="font-bold text-white">{selectedTenant.emergency_contact_name || 'Not provided'} ({selectedTenant.relationship_with_emergency_contact || 'Not provided'})</span></div><div><span className="text-slate-400 block">Phone</span><a href={`tel:${selectedTenant.emergency_contact_number}`} className="font-bold text-amber-300 hover:underline">{selectedTenant.emergency_contact_number || 'Not provided'}</a></div></div>
            </section>

            <section className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Identity Documents</h5>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"><div><p className="text-slate-500">Aadhaar number</p><p className="font-bold text-white font-mono mt-0.5">{selectedTenant.id_proof_number || 'Not provided'}</p></div>{selectedTenant.id_proof_document_url ? <a href={getAssetUrl(selectedTenant.id_proof_document_url)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold">Open Aadhaar PDF</a> : <span className="text-amber-300">No Aadhaar PDF uploaded.</span>}</div>
            </section>

            {/* Roommates in same room */}
            {selectedTenant.roommates && selectedTenant.roommates.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roommates in Same Room</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTenant.roommates.map((rm) => (
                    <div key={rm.id} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-2.5 text-xs">
                      <img src={getAssetUrl(rm.profile_photo_url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} alt={rm.full_name} className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-white">{rm.full_name}</p>
                        <p className="text-[10px] text-indigo-400">{rm.bed_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} title="Edit Resident Profile" subtitle="Update contact, address, emergency, occupation, and Aadhaar information." maxWidth="max-w-3xl">
        {editProfile && (
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Full name', 'full_name', 'text'], ['Mobile number', 'mobile_number', 'tel'], ['Email address', 'email', 'email'],
                ['Aadhaar number', 'id_proof_number', 'text'], ['Emergency contact name', 'emergency_contact_name', 'text'], ['Emergency contact number', 'emergency_contact_number', 'tel'],
              ].map(([label, field, type]) => <div key={field}><label className="block text-xs font-semibold text-slate-300 mb-1">{label}</label><input required type={type} value={editProfile[field] || ''} onChange={(e) => setEditProfile({ ...editProfile, [field]: field === 'id_proof_number' ? e.target.value.replace(/\D/g, '').slice(0, 12) : e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500" /></div>)}
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label><select value={editProfile.gender || 'male'} onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Relation to emergency contact</label><input value={editProfile.relationship_with_emergency_contact || ''} onChange={(e) => setEditProfile({ ...editProfile, relationship_with_emergency_contact: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Occupation</label><select value={editProfile.occupation_type || 'working'} onChange={(e) => setEditProfile({ ...editProfile, occupation_type: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"><option value="working">Working Professional</option><option value="student">Student</option><option value="self_employed">Self-Employed</option><option value="business_owner">Business Owner</option><option value="freelancer">Freelancer</option><option value="job_seeker">Job Seeker</option><option value="other">Other</option></select></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Company / College</label><input value={editProfile.occupation_type === 'student' ? (editProfile.college_name || '') : (editProfile.company_name || '')} onChange={(e) => setEditProfile({ ...editProfile, company_name: editProfile.occupation_type === 'student' ? '' : e.target.value, college_name: editProfile.occupation_type === 'student' ? e.target.value : '' })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" /></div>
            </div>
            <div><label className="block text-xs font-semibold text-slate-300 mb-1">Permanent address</label><textarea required rows="3" value={editProfile.permanent_address || ''} onChange={(e) => setEditProfile({ ...editProfile, permanent_address: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800"><button type="button" onClick={() => setEditProfileOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Cancel</button><button type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50">{submitting ? 'Saving...' : 'Save Changes'}</button></div>
          </form>
        )}
      </Modal>

      {/* Modal: Check-out Confirmation */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={`Check Out ${selectedTenant?.full_name}`}
        subtitle="This action will free the assigned bed and archive the tenant into permanent history."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Check Out Date</label>
            <input
              type="date"
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Leaving</label>
            <input
              type="text"
              value={checkoutReason}
              onChange={(e) => setCheckoutReason(e.target.value)}
              placeholder="e.g. Job transfer to Hyderabad / Completed course"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs space-y-1 text-rose-200">
            <p className="font-bold text-white">System Actions on Checkout:</p>
            <p>• Bed ({selectedTenant?.bed_number}) will automatically transition to <strong>Available</strong>.</p>
            <p>• Room & Floor occupancy metrics will update in real-time.</p>
            <p>• Historical payments and ledger records will remain preserved permanently.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition disabled:opacity-50"
            >
              {submitting ? 'Processing Checkout...' : 'Confirm Checkout & Free Bed'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
