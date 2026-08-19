import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  Shield,
  Calendar,
  Building,
  BedDouble,
  Briefcase,
  GraduationCap,
  FileText,
  Save,
  CheckCircle2,
  Edit2,
  Camera,
  Upload,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
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

const maskIdNumber = (value) => {
  if (!value) return 'Verified';
  const lastFour = value.replace(/\D/g, '').slice(-4);
  return lastFour ? `•••• •••• ${lastFour}` : 'Verified';
};

export const TenantProfile = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      if (meRes.success && meRes.user?.tenant) {
        const fullRes = await api.get(`/tenants/${meRes.user.tenant.id}`);
        if (fullRes.success) setProfile(fullRes.tenant);
      }
    } catch (err) {
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const openEdit = () => {
    setFormData({ ...profile });
    setEditing(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z][a-zA-Z .'-]{1,79}$/.test(formData.full_name?.trim() || '')) return showError('Enter a valid full name.');
    if (!/^\+?[1-9]\d{7,14}$/.test(String(formData.mobile_number || '').replace(/[\s()-]/g, ''))) return showError('Enter a valid mobile number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '')) return showError('Enter a valid email address.');
    if (!formData.emergency_contact_name?.trim() || !/^\+?[1-9]\d{7,14}$/.test(String(formData.emergency_contact_number || '').replace(/[\s()-]/g, ''))) return showError('Complete your emergency contact details.');

    try {
      const res = await api.put('/auth/profile', formData);
      if (res.success) {
        showSuccess('Your profile has been updated.');
        setEditing(false);
        await loadProfile();
      }
    } catch (err) { showError(err.message || 'Could not update your profile.'); }
  };

  // Handle Photo Upload from local file or URL
  const handlePhotoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return showError('Please select a valid image file (JPG, PNG, WEBP).');
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      await updatePhoto(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const updatePhoto = async (newUrl) => {
    if (!newUrl) return;
    setUploadingPhoto(true);
    try {
      const res = await api.put('/auth/profile', {
        ...profile,
        profile_photo_url: newUrl,
        avatar_url: newUrl
      });
      if (res.success) {
        showSuccess('Profile photo updated successfully!');
        setPhotoModalOpen(false);
        await loadProfile();
      }
    } catch (err) {
      showError(err.message || 'Failed to update photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your profile details..." />;
  }

  const formatDate = (value) => {
    const datePart = String(value || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return 'Not set';
    return new Date(`${datePart}T00:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const isPreBooked = profile?.status === 'pre_booked';
  const moveInDate = formatDate(profile?.move_in_date || profile?.joining_date);
  const nextRentDueDate = formatDate(profile?.next_rent_due_date);
  const organization = profile?.occupation_type === 'student' ? profile?.college_name : profile?.company_name;
  const currentAvatar = getAssetUrl(profile?.profile_photo_url) || getAssetUrl(user?.avatar_url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-indigo-400" />
            <span>My Resident Profile</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personal identity, accommodation, emergency contacts, and verified credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant={profile?.status || 'active'} size="lg">
            {profile?.status || 'active'}
          </Badge>
          <button
            onClick={openEdit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 bg-slate-900/90 shadow-xl">
        {/* Profile Avatar & Primary Information */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800">
          <div className="relative group">
            <img
              src={currentAvatar}
              alt={profile?.full_name}
              className="w-24 h-24 rounded-3xl object-cover ring-2 ring-indigo-500/50 shadow-xl"
            />
            {/* Camera / Upload Button Overlay */}
            <button
              onClick={() => {
                setPhotoUrlInput(currentAvatar);
                setPhotoModalOpen(true);
              }}
              title="Change Profile Photo"
              className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg border-2 border-slate-950 transition transform hover:scale-110 flex items-center justify-center cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-black text-white">{profile?.full_name || user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Verified Resident
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isPreBooked ? `Scheduled to move in on ${moveInDate}` : `Resident since ${moveInDate}`}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> {profile?.mobile_number}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {profile?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Stay & Room Allocation Details */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 mb-3">Stay & Billing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Room & Floor</span>
              <span className="font-bold text-white text-sm block">Floor {profile?.floor_number || 1} • Room {profile?.room_number || '101'}</span>
              <span className="text-indigo-400 font-semibold block">{profile?.bed_number || 'BED 01'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Monthly Tariff</span>
              <span className="font-bold text-emerald-400 text-sm block">₹{Number(profile?.monthly_rent || 5500).toLocaleString('en-IN')}</span>
              <span className="text-slate-400 text-[10px] block">Next due: {nextRentDueDate}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Stay Status</span>
              <span className="font-bold text-white text-sm block">{moveInDate}</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">Deposit: ₹{Number(profile?.security_deposit || 10000).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Occupation & Education Details */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Occupation Details</h3>
            <Link
              to="/tenant/announcements"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-bold transition border border-slate-700"
            >
              <Megaphone className="w-3.5 h-3.5 text-teal-400" />
              <span>Announcements & Noticeboard</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {profile?.occupation_type === 'student' ? <GraduationCap className="w-5 h-5 text-blue-400" /> : <Briefcase className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Occupation Type</span>
                <span className="font-bold text-white text-sm">{occupationLabels[profile?.occupation_type] || 'Working Professional'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                {profile?.occupation_type === 'student' ? 'College / University' : 'Company / Organization'}
              </span>
              <span className="font-bold text-white text-sm">{organization || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Emergency Contact
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <span className="text-slate-400 text-[10px] block">Contact Person</span>
              <p className="font-bold text-white text-sm">
                {profile?.emergency_contact_name || 'Not provided'} {profile?.relationship_with_emergency_contact ? `(${profile.relationship_with_emergency_contact})` : ''}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Emergency Phone</span>
              <p className="font-bold text-amber-300 text-sm">{profile?.emergency_contact_number || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* ID Verification Document */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Gender</span>
            <p className="font-bold text-white text-sm capitalize">{profile?.gender || 'Male'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Government ID Verification</span>
            <p className="font-bold text-white uppercase">{profile?.id_proof_type || 'Aadhaar'} Card</p>
            <p className="font-mono text-slate-400 text-[11px] mt-0.5">{maskIdNumber(profile?.id_proof_number)}</p>
            {profile?.id_proof_document_url && (
              <a
                href={getAssetUrl(profile.id_proof_document_url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-indigo-300 hover:text-indigo-200"
              >
                <FileText className="w-3.5 h-3.5" /> View Uploaded Document
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Change Profile Photo */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Update Profile Photo"
        subtitle="Upload an image file or choose an avatar"
        maxWidth="max-w-md"
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-center gap-3.5 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <img
              src={photoUrlInput || currentAvatar}
              alt="Preview"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md shrink-0"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-white">Active Photo Preview</p>
              <p className="text-[11px] text-slate-400">Choose a new file or preset below</p>
            </div>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Choose Image File (JPG / PNG)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Or avatar presets</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
            ].map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPhotoUrlInput(img)}
                className={`rounded-xl overflow-hidden border-2 p-0.5 transition ${
                  photoUrlInput === img ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <img src={img} alt="preset" className="w-full h-11 sm:h-12 rounded-lg object-cover" />
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setPhotoModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={() => updatePhoto(photoUrlInput)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {uploadingPhoto ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit Profile Details */}
      <Modal
        isOpen={editing}
        onClose={() => setEditing(false)}
        title="Edit My Profile"
        subtitle="Keep your contact and emergency information up to date."
        maxWidth="max-w-3xl"
      >
        {formData && (
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
                <input
                  required
                  type="tel"
                  value={formData.mobile_number || ''}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Occupation Type</label>
                <select
                  value={formData.occupation_type || 'working'}
                  onChange={(e) => setFormData({ ...formData, occupation_type: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="working">Working Professional</option>
                  <option value="student">Student</option>
                  <option value="self_employed">Self-employed</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="job_seeker">Job Seeker</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {formData.occupation_type === 'student' ? 'College / University Name' : 'Company / Organization Name'}
                </label>
                <input
                  type="text"
                  value={formData.occupation_type === 'student' ? (formData.college_name || '') : (formData.company_name || '')}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_name: formData.occupation_type === 'student' ? '' : e.target.value,
                    college_name: formData.occupation_type === 'student' ? e.target.value : ''
                  })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact Person</label>
                <input
                  required
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Phone Number</label>
                <input
                  required
                  type="tel"
                  value={formData.emergency_contact_number || ''}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.relationship_with_emergency_contact || 'Parent'}
                  onChange={(e) => setFormData({ ...formData, relationship_with_emergency_contact: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
