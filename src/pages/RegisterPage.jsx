import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Building,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  HeartHandshake,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();

  // Step Tracker
  const [currentStep, setCurrentStep] = useState(1); // 1: Contact & OTP, 2: Bed Selection, 3: Emergency & Password

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
    floorId: '',
    roomId: '',
    bed_id: '',
    joining_date: new Date().toISOString().split('T')[0],
    emergency_contact_name: '',
    emergency_contact_number: '',
    relationship_with_emergency_contact: 'Parent',
    occupation_type: 'working',
    company_name: '',
    college_name: '',
    aadhaar_number: '',
    permanent_address: '',
    gender: 'male',
    password: '',
    confirmPassword: ''
  });

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const otpInputRefs = useRef([]);

  // Building & Bed Availability State
  const [hierarchy, setHierarchy] = useState([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [selectedFloorObj, setSelectedFloorObj] = useState(null);
  const [selectedRoomObj, setSelectedRoomObj] = useState(null);
  const [selectedBedObj, setSelectedBedObj] = useState(null);

  const [loadingRegister, setLoadingRegister] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadhaarDocument, setAadhaarDocument] = useState(null);

  // Load Building Hierarchy for Bed Selection
  useEffect(() => {
    const loadBuildingHierarchy = async () => {
      try {
        setLoadingHierarchy(true);
        const res = await api.get('/pg/hierarchy');
        if (res.success && res.hierarchy) {
          setHierarchy(res.hierarchy);
        }
      } catch (err) {
        console.warn('Failed to load room hierarchy:', err.message);
      } finally {
        setLoadingHierarchy(false);
      }
    };
    loadBuildingHierarchy();
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Send OTP
  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.trim().length < 8) {
      showError('Please enter a valid mobile or WhatsApp number.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await api.post('/auth/send-otp', { phone: formData.phone.trim() });
      if (res.success) {
        setOtpSent(true);
        setFormData(prev => ({ ...prev, otp: '' }));
        setOtpDigits(Array(6).fill(''));
        setCountdown(60);
        setDemoOtpCode(res.demoOtp || '123456');
        showSuccess(`OTP sent to ${formData.phone}! Demo code: ${res.demoOtp || '123456'}`);
      }
    } catch (err) {
      showError(err.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(formData.otp)) {
      showError('Please enter the 6-digit OTP code received.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        phone: formData.phone.trim(),
        otp: formData.otp.trim()
      });
      if (res.success) {
        setOtpVerified(true);
        showSuccess('Mobile / WhatsApp verified successfully!');
      }
    } catch (err) {
      showError(err.message || 'Invalid OTP code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const updateOtp = (digits) => {
    setOtpDigits(digits);
    setFormData(prev => ({ ...prev, otp: digits.join('') }));
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const digits = [...otpDigits];
    digits[index] = digit;
    updateOtp(digits);
    if (digit && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const digits = [...otpDigits];
      digits[index - 1] = '';
      updateOtp(digits);
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedOtp = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedOtp) return;
    updateOtp(Array.from({ length: 6 }, (_, i) => pastedOtp[i] || ''));
    otpInputRefs.current[Math.min(pastedOtp.length, 6) - 1]?.focus();
  };

  // Floor Selection
  const handleSelectFloor = (floor) => {
    setSelectedFloorObj(floor);
    setFormData(prev => ({ ...prev, floorId: floor.id, roomId: '', bed_id: '' }));
    setSelectedBedObj(null);
    if (floor.rooms.length > 0) {
      setSelectedRoomObj(floor.rooms[0]);
      setFormData(prev => ({ ...prev, roomId: floor.rooms[0].id }));
      const availBed = floor.rooms[0].beds.find(b => b.status === 'available');
      if (availBed) {
        setSelectedBedObj(availBed);
        setFormData(prev => ({ ...prev, bed_id: availBed.id }));
      }
    } else {
      setSelectedRoomObj(null);
    }
  };

  // Room Selection
  const handleSelectRoom = (room) => {
    setSelectedRoomObj(room);
    setFormData(prev => ({ ...prev, roomId: room.id, bed_id: '' }));
    const availBed = room.beds.find(b => b.status === 'available');
    if (availBed) {
      setSelectedBedObj(availBed);
      setFormData(prev => ({ ...prev, bed_id: availBed.id }));
    } else {
      setSelectedBedObj(null);
    }
  };

  // Bed Selection
  const handleSelectBed = (bed) => {
    if (bed.status !== 'available') {
      showError(`This bed is currently ${bed.status}. Please select a vacant bed.`);
      return;
    }
    setSelectedBedObj(bed);
    setFormData(prev => ({ ...prev, bed_id: bed.id }));
    showInfo(`Selected: ${bed.bed_number} (₹${Number(bed.monthly_rent).toLocaleString('en-IN')}/mo)`);
  };

  // Final Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!/^[a-zA-Z][a-zA-Z .'-]{1,79}$/.test(formData.name.trim())) {
      showError('Enter a valid full name using letters only.');
      setCurrentStep(1);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      showError('Enter a valid email address.');
      setCurrentStep(1);
      return;
    }

    if (!otpVerified) {
      showError('Please verify your mobile/WhatsApp number with OTP first.');
      setCurrentStep(1);
      return;
    }

    if (!formData.bed_id) {
      showError('Please select your preferred floor, room, and available bed.');
      setCurrentStep(2);
      return;
    }

    if (!/^\d{12}$/.test(formData.aadhaar_number)) {
      showError('Please enter a valid 12-digit Aadhaar number.');
      setCurrentStep(3);
      return;
    }

    if (!profilePhoto || !aadhaarDocument) {
      showError('Please upload your profile photo and Aadhaar card PDF.');
      setCurrentStep(3);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(profilePhoto.type) || profilePhoto.size > 5 * 1024 * 1024) {
      showError('Profile photo must be a JPG, PNG, or WEBP image smaller than 5 MB.');
      setCurrentStep(3);
      return;
    }

    if (aadhaarDocument.type !== 'application/pdf' || aadhaarDocument.size > 5 * 1024 * 1024) {
      showError('Aadhaar document must be a PDF smaller than 5 MB.');
      setCurrentStep(3);
      return;
    }

    if (!formData.emergency_contact_name.trim() || !/^\+?[1-9]\d{7,14}$/.test(formData.emergency_contact_number.replace(/[\s()-]/g, ''))) {
      showError('Enter an emergency contact name and a valid phone number.');
      setCurrentStep(3);
      return;
    }

    if ((isStudent ? formData.college_name : formData.company_name).trim().length < 2) {
      showError(`Enter a valid ${isStudent ? 'college/institution' : 'company/organization'} name.`);
      setCurrentStep(3);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match.');
      setCurrentStep(3);
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters.');
      setCurrentStep(3);
      return;
    }

    setLoadingRegister(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        bed_id: formData.bed_id,
        emergency_contact_name: formData.emergency_contact_name.trim(),
        emergency_contact_number: formData.emergency_contact_number.trim(),
        relationship_with_emergency_contact: formData.relationship_with_emergency_contact || 'Parent',
        occupation_type: formData.occupation_type,
        company_name: formData.company_name,
        college_name: formData.college_name,
        permanent_address: formData.permanent_address,
        gender: formData.gender,
        joining_date: formData.joining_date,
        aadhaar_number: formData.aadhaar_number,
        profile_photo: profilePhoto,
        aadhaar_document: aadhaarDocument,
        role: 'tenant'
      });

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      showSuccess(`Welcome ${formData.name}! Bed ${selectedBedObj?.bed_number} allocated successfully!`);
      navigate('/tenant/dashboard');
    } catch (err) {
      showError(err.message || 'Registration failed.');
    } finally {
      setLoadingRegister(false);
    }
  };

  const isStudent = formData.occupation_type === 'student';
  const today = new Date().toISOString().split('T')[0];
  const isPreBooking = formData.joining_date > today;
  const organizationLabel = isStudent ? 'College / Institution Name' : 'Company / Organization Name';
  const organizationPlaceholder = isStudent ? 'PES University / RV College' : 'Company, business, or organization name';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Building className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">Royal Orchid PG</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Resident Registration & Bed Selection</h2>
          <p className="text-xs text-slate-400 mt-1">Verify mobile via OTP, select your desired room & bed, and activate your stay</p>
        </div>

        {/* Step Progress Tracker */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-md mx-auto">
          {[
            { step: 1, label: '1. Mobile & OTP' },
            { step: 2, label: '2. Select Bed' },
            { step: 3, label: '3. Complete' }
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step)}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${currentStep === item.step
                  ? 'bg-indigo-600 text-white shadow-md'
                  : item.step < currentStep || (item.step === 1 && otpVerified) || (item.step === 2 && formData.bed_id)
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800/80 text-slate-400'
                }`}
            >
              {item.step === 1 && otpVerified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
              {item.step === 2 && formData.bed_id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Multi-Step Form Content */}
        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          {/* ================= STEP 1: Personal Info & OTP Verification ================= */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 block mb-1">
                  Step 1: Contact Identity & OTP Verification
                </span>
                <p className="text-[11px] text-slate-400">
                  Verify your mobile / WhatsApp number to receive booking alerts and payment receipts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Patil"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Compact Mobile / WhatsApp Input + Send OTP Button */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile / WhatsApp Number <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      disabled={otpVerified}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="flex-1 px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-75 disabled:bg-slate-900"
                    />

                    {!otpVerified ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending || countdown > 0 || !formData.phone}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{otpSending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Send OTP'}</span>
                      </button>
                    ) : (
                      <div className="px-3.5 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* OTP Code Input Box */}
                {otpSent && !otpVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="sm:col-span-2 p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-indigo-300">
                        Enter 6-Digit OTP Code <span className="text-rose-400 font-bold">*</span>
                      </label>
                      {demoOtpCode && (
                        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Demo OTP: {demoOtpCode}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex gap-2 justify-between sm:justify-start" onPaste={handleOtpPaste}>
                        {Array.from({ length: 6 }, (_, index) => (
                          <input
                            key={index}
                            ref={(element) => { otpInputRefs.current[index] = element; }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={index === 0 ? 'one-time-code' : 'off'}
                            maxLength={1}
                            aria-label={`OTP digit ${index + 1}`}
                            value={otpDigits[index]}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800 border border-indigo-500/50 text-center text-base font-bold font-mono text-white focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/30"
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || formData.otp.length !== 6}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 shrink-0"
                      >
                        {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.name?.trim() || !/^[a-zA-Z][a-zA-Z .'-]{1,79}$/.test(formData.name.trim())) {
                      showError('Please enter a valid full name.');
                      return;
                    }
                    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                      showError('Please enter a valid email address.');
                      return;
                    }
                    if (!formData.phone?.trim() || !/^\+?[1-9]\d{7,14}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
                      showError('Please enter a valid mobile number.');
                      return;
                    }
                    if (!otpVerified) {
                      showError('Please verify your mobile number with OTP code before continuing.');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: Interactive Floor, Room & Bed Selection ================= */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 block mb-1">
                  Step 2: Choose Your Floor, Room & Bed
                </span>
                <p className="text-[11px] text-slate-400">
                  Select your preferred building floor and view live available beds. Click a vacant bed to lock your allocation.
                </p>
              </div>

              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
                <label className="block text-xs font-bold text-white mb-3">When will you start your PG stay?</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button type="button" onClick={() => setFormData({ ...formData, joining_date: today })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${!isPreBooking ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    Start Today
                  </button>
                  <button type="button" onClick={() => { const date = new Date(); date.setDate(date.getDate() + 1); setFormData({ ...formData, joining_date: date.toISOString().split('T')[0] }); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${isPreBooking ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    Pre-book for Later
                  </button>
                  <div className="sm:ml-auto">
                    <label className="sr-only" htmlFor="joining-date">Move-in date</label>
                    <input id="joining-date" type="date" min={today} value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className="w-full sm:w-auto px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <p className={`mt-3 text-[11px] ${isPreBooking ? 'text-indigo-300' : 'text-emerald-300'}`}>
                  {isPreBooking ? `Your selected bed will be reserved until ${new Date(`${formData.joining_date}T00:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}.` : 'Your bed will be activated immediately after registration.'}
                </p>
              </div>

              {loadingHierarchy ? (
                <div className="text-center py-8 text-xs text-slate-400">Loading building layout...</div>
              ) : (
                <div className="space-y-4">
                  {/* Floor Tabs */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">1. Select Building Floor</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {hierarchy.map((flr) => (
                        <button
                          key={flr.id}
                          type="button"
                          onClick={() => handleSelectFloor(flr)}
                          className={`p-2.5 rounded-xl border text-left transition text-xs font-semibold ${selectedFloorObj?.id === flr.id
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                          <span className="block font-bold text-[11px]">{flr.name.split('-')[0]}</span>
                          <span className={`text-[10px] block ${selectedFloorObj?.id === flr.id ? 'text-indigo-100' : 'text-emerald-400'}`}>
                            {flr.available_beds} Free Beds
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room Selector in Selected Floor */}
                  {selectedFloorObj && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        2. Select Room in {selectedFloorObj.name}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {selectedFloorObj.rooms.map((room) => (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => handleSelectRoom(room)}
                            className={`p-3 rounded-xl border text-left transition ${selectedRoomObj?.id === room.id
                                ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md'
                                : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">Room {room.room_number}</span>
                              <span className="text-[10px] uppercase text-indigo-300 font-semibold">{room.room_type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                              <span>₹{Number(room.base_rent).toLocaleString('en-IN')}/mo</span>
                              <span className="text-emerald-400 font-bold">{room.available_beds} Free</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Beds Grid */}
                  {selectedRoomObj && (
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">
                          3. Pick Available Bed in Room {selectedRoomObj.room_number}
                        </label>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          Monthly Rent: ₹{Number(selectedRoomObj.base_rent).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {selectedRoomObj.beds.map((bed) => {
                          const isSelected = selectedBedObj?.id === bed.id;
                          const isAvailable = bed.status === 'available';

                          return (
                            <button
                              key={bed.id}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => handleSelectBed(bed)}
                              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${isSelected
                                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400/50 scale-[1.03]'
                                  : isAvailable
                                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 hover:border-emerald-500 hover:bg-emerald-950/50 cursor-pointer'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <BedDouble className="w-4 h-4" />
                                <span className="text-[10px] uppercase font-bold">
                                  {isSelected ? 'Selected' : bed.status}
                                </span>
                              </div>
                              <span className="font-extrabold text-xs tracking-tight">{bed.bed_number}</span>
                              <span className="text-[10px] opacity-80 mt-0.5">
                                ₹{Number(bed.monthly_rent || selectedRoomObj.base_rent).toLocaleString('en-IN')}/mo
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Bed Summary Banner */}
                      {selectedBedObj && (
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs">
                          <span className="text-indigo-200">
                            Selected: <strong>Floor {selectedFloorObj?.floor_number} • Room {selectedRoomObj.room_number} • {selectedBedObj.bed_number}</strong>
                          </span>
                          <span className="text-emerald-400 font-extrabold">
                            ₹{Number(selectedBedObj.monthly_rent || selectedRoomObj.base_rent).toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedBedObj) {
                      showError('Please click an available bed to select your room.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 3: Emergency & Password Details ================= */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 block mb-1">
                  Step 3: Emergency Contact & Account Security
                </span>
                <p className="text-[11px] text-slate-400">
                  Fill in guardian information for emergency safety and set your login password.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Emergency Contact / Guardian <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="e.g. Suresh Patil"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Emergency Contact Phone <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    maxLength="16"
                    value={formData.emergency_contact_number}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value.replace(/[^\d+\s()-]/g, '') })}
                    placeholder="+91 98220 99887"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Occupation Type</label>
                  <select
                    value={formData.occupation_type}
                    onChange={(e) => setFormData({ ...formData, occupation_type: e.target.value, company_name: '', college_name: '' })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="working">Working Professional</option>
                    <option value="student">Student</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="job_seeker">Job Seeker</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {organizationLabel}
                  </label>
                  <input
                    type="text"
                    value={isStudent ? formData.college_name : formData.company_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      company_name: isStudent ? '' : e.target.value,
                      college_name: isStudent ? e.target.value : ''
                    })}
                    placeholder={organizationPlaceholder}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aadhaar Number <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength="12"
                    value={formData.aadhaar_number}
                    onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value.replace(/\D/g, '') })}
                    placeholder="12-digit Aadhaar number"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Profile Photo <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                    className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 file:mr-3 file:border-0 file:rounded-lg file:bg-indigo-500/15 file:px-2 file:py-1 file:text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aadhaar Card PDF <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept="application/pdf"
                    onChange={(e) => setAadhaarDocument(e.target.files?.[0] || null)}
                    className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 file:mr-3 file:border-0 file:rounded-lg file:bg-indigo-500/15 file:px-2 file:py-1 file:text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Password <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="•••••••• (min 6 characters)"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Summary of Chosen Allocation */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider block">Confirmed Allocation:</span>
                <p className="text-slate-300">
                  • <strong>Stay: </strong>Room {selectedRoomObj?.room_number} ({selectedBedObj?.bed_number})
                </p>
                <p className={isPreBooking ? 'text-indigo-300' : 'text-emerald-400'}>
                  • {isPreBooking ? `Pre-booked move-in date: ${new Date(`${formData.joining_date}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Starting your stay today.'}
                </p>
                <p className="text-emerald-400">
                  • Mobile/WhatsApp {formData.phone} verified with OTP.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loadingRegister}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-indigo-600/30 transition transform hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loadingRegister ? 'Allocating Bed & Registering...' : 'Complete Registration & Lock Bed'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>Already registered? </span>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
