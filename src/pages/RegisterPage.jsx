import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Building,
  ArrowRight,
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();

  // Step Tracker: 1: Contact & OTP, 2: Bed Selection, 3: Details & Password
  const [currentStep, setCurrentStep] = useState(1);

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
      showError('Please enter a valid mobile number.');
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
      showError('Please enter the 6-digit OTP code.');
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
        showSuccess('Mobile verified successfully!');
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

    // Automatically select the first room that has available beds
    const firstAvailRoom = floor.rooms.find(r => Number(r.available_beds) > 0) || floor.rooms[0] || null;
    if (firstAvailRoom) {
      setSelectedRoomObj(firstAvailRoom);
      setFormData(prev => ({ ...prev, roomId: firstAvailRoom.id }));
      const availBed = firstAvailRoom.beds.find(b => b.status === 'available');
      if (availBed) {
        setSelectedBedObj(availBed);
        setFormData(prev => ({ ...prev, bed_id: availBed.id }));
      }
    } else {
      setSelectedRoomObj(null);
    }
  };

  // Room Selection with Automatic Blocking of Full Rooms
  const handleSelectRoom = (room) => {
    if (Number(room.available_beds) <= 0) {
      showError(`Room ${room.room_number} is completely full. Please choose a room with vacant beds.`);
      return;
    }
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
      showError(`Bed ${bed.bed_number} is occupied. Please select an available bed.`);
      return;
    }
    setSelectedBedObj(bed);
    setFormData(prev => ({ ...prev, bed_id: bed.id }));
    showInfo(`Selected Bed ${bed.bed_number} (₹${Number(bed.monthly_rent).toLocaleString('en-IN')}/mo)`);
  };

  // Final Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!/^[a-zA-Z][a-zA-Z .'-]{1,79}$/.test(formData.name.trim())) {
      showError('Enter a valid full name.');
      setCurrentStep(1);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      showError('Enter a valid email address.');
      setCurrentStep(1);
      return;
    }

    if (!otpVerified) {
      showError('Please verify your mobile number with OTP first.');
      setCurrentStep(1);
      return;
    }

    if (!formData.bed_id) {
      showError('Please select an available bed.');
      setCurrentStep(2);
      return;
    }

    if (!/^\d{12}$/.test(formData.aadhaar_number)) {
      showError('Enter a valid 12-digit Aadhaar number.');
      setCurrentStep(3);
      return;
    }

    if (!profilePhoto || !aadhaarDocument) {
      showError('Please upload both profile photo and Aadhaar PDF.');
      setCurrentStep(3);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(profilePhoto.type) || profilePhoto.size > 5 * 1024 * 1024) {
      showError('Profile photo must be a JPG, PNG, or WEBP under 5 MB.');
      setCurrentStep(3);
      return;
    }

    if (aadhaarDocument.type !== 'application/pdf' || aadhaarDocument.size > 5 * 1024 * 1024) {
      showError('Aadhaar document must be a PDF under 5 MB.');
      setCurrentStep(3);
      return;
    }

    if (!formData.emergency_contact_name.trim() || !/^\+?[1-9]\d{7,14}$/.test(formData.emergency_contact_number.replace(/[\s()-]/g, ''))) {
      showError('Enter an emergency contact name and phone.');
      setCurrentStep(3);
      return;
    }

    if ((isStudent ? formData.college_name : formData.company_name).trim().length < 2) {
      showError(`Enter your ${isStudent ? 'college' : 'company'} name.`);
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
      await register({
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
      showSuccess(`Welcome ${formData.name}! Bed ${selectedBedObj?.bed_number} booked successfully!`);
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
  const organizationLabel = isStudent ? 'College / University' : 'Company / Organization';
  const organizationPlaceholder = isStudent ? 'e.g. PES University' : 'e.g. Infosys / TCS';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans pt-16 sm:pt-6">
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Floating Navigation: Back to Home & Sign In */}
      <div className="absolute top-4 inset-x-4 sm:top-6 sm:inset-x-8 flex items-center justify-between z-20 max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold backdrop-blur transition shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold backdrop-blur transition"
        >
          <span>Existing Resident? Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6 mt-4 sm:mt-0"
      >
        {/* Clean Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Building className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Royal Orchid PG</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Resident Registration</h2>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto">
          {[
            { step: 1, label: '1. Contact & OTP' },
            { step: 2, label: '2. Select Bed' },
            { step: 3, label: '3. Complete' }
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step)}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${currentStep === item.step
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

        {/* Form Body */}
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          {/* ================= STEP 1: Personal Contact & OTP ================= */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Patil"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      disabled={otpVerified}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="flex-1 px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-75 disabled:bg-slate-900"
                    />

                    {!otpVerified ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending || countdown > 0 || !formData.phone}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{otpSending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Send OTP'}</span>
                      </button>
                    ) : (
                      <div className="px-3.5 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0">
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
                    className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-500/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-indigo-300">
                        Enter 6-Digit OTP Code <span className="text-rose-400">*</span>
                      </label>
                      {demoOtpCode && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Demo OTP: {demoOtpCode}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
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
                        {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
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
                      showError('Please verify your mobile with OTP first.');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <span>Select Room & Bed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: Floor, Room & Bed Selection ================= */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Booking Type: Immediate Move-In vs Pre-Book Toggle */}
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                <label className="block text-xs font-semibold text-slate-300">Booking Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, joining_date: today })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                      !isPreBooking
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Immediate Move-In (Today)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isPreBooking) {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setFormData({ ...formData, joining_date: tomorrow.toISOString().split('T')[0] });
                      }
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                      isPreBooking
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Pre-Book for Later</span>
                  </button>
                </div>

                {/* If Pre-Booking selected, show calendar date selector */}
                {isPreBooking && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-indigo-300 font-medium">Select Move-In Date:</span>
                    <input
                      type="date"
                      min={today}
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className="px-3 py-1.5 bg-slate-800 border border-indigo-500/50 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                )}
              </div>

              {loadingHierarchy ? (
                <div className="text-center py-8 text-xs text-slate-400">Loading rooms...</div>
              ) : (
                <div className="space-y-4">
                  {/* Floor Tabs (Only Clean Floor Name) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Floor</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {hierarchy.map((flr) => {
                        const cleanFloorName = flr.name.replace(/[-–—].*$/, '').trim();
                        const isSelected = selectedFloorObj?.id === flr.id;

                        return (
                          <button
                            key={flr.id}
                            type="button"
                            onClick={() => handleSelectFloor(flr)}
                            className={`p-2.5 rounded-xl border text-left transition ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <span className="block font-bold text-xs">{cleanFloorName}</span>
                            <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-emerald-400'}`}>
                              {flr.available_beds} Free Beds
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Selector (Automatically Blocks Full Rooms) */}
                  {selectedFloorObj && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Select Room ({selectedFloorObj.name.replace(/[-–—].*$/, '').trim()})
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {selectedFloorObj.rooms.map((room) => {
                          const isAvailable = Number(room.available_beds) > 0;
                          const isSelected = selectedRoomObj?.id === room.id;

                          return (
                            <button
                              key={room.id}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => handleSelectRoom(room)}
                              className={`p-3 rounded-xl border text-left transition ${
                                !isAvailable
                                  ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                  : isSelected
                                    ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md'
                                    : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-bold text-xs ${isAvailable ? 'text-white' : 'text-slate-500'}`}>
                                  Room {room.room_number}
                                </span>
                                <span className={`text-[10px] uppercase font-semibold ${isAvailable ? 'text-indigo-300' : 'text-slate-500'}`}>
                                  {room.room_type.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] mt-1">
                                <span className={isAvailable ? 'text-slate-300' : 'text-slate-600'}>
                                  ₹{Number(room.base_rent).toLocaleString('en-IN')}/mo
                                </span>
                                {isAvailable ? (
                                  <span className="text-emerald-400 font-bold text-[10px]">{room.available_beds} Free</span>
                                ) : (
                                  <span className="text-rose-400 font-bold text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                    Full
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Individual Beds Grid */}
                  {selectedRoomObj && (
                    <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white">
                          Select Bed in Room {selectedRoomObj.room_number}
                        </label>
                        <span className="text-[11px] text-slate-400">
                          ₹{Number(selectedRoomObj.base_rent).toLocaleString('en-IN')}/month
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
                              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400/50 scale-[1.02]'
                                  : isAvailable
                                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 hover:border-emerald-500 hover:bg-emerald-950/50 cursor-pointer'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <BedDouble className="w-4 h-4" />
                                <span className="text-[10px] uppercase font-bold">
                                  {isSelected ? 'Selected' : isAvailable ? 'Available' : 'Occupied'}
                                </span>
                              </div>
                              <span className="font-extrabold text-xs">{bed.bed_number}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Bed Summary */}
                      {selectedBedObj && (
                        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs">
                          <span className="text-indigo-200">
                            Selected: <strong>Floor {selectedFloorObj?.floor_number} • Room {selectedRoomObj.room_number} • {selectedBedObj.bed_number}</strong>
                          </span>
                          <span className="text-emerald-400 font-bold">
                            ₹{Number(selectedBedObj.monthly_rent || selectedRoomObj.base_rent).toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
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
                      showError('Please click an available bed to select.');
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

          {/* ================= STEP 3: Details, Documents & Password ================= */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Emergency Contact Name <span className="text-rose-400">*</span>
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
                    Emergency Contact Phone <span className="text-rose-400">*</span>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Occupation</label>
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
                    Aadhaar Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength="12"
                    value={formData.aadhaar_number}
                    onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value.replace(/\D/g, '') })}
                    placeholder="12-digit number"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Profile Photo <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                    className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 file:mr-3 file:border-0 file:rounded-lg file:bg-indigo-500/15 file:px-2 file:py-1 file:text-indigo-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aadhaar Card PDF <span className="text-rose-400">*</span>
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
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Clean Summary Card */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Room {selectedRoomObj?.room_number} • {selectedBedObj?.bed_number}</span>
                  <span className="text-slate-400 text-[11px]">
                    {isPreBooking ? `Move-in: ${new Date(`${formData.joining_date}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Move-in: Today'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-extrabold text-sm block">
                    ₹{Number(selectedBedObj?.monthly_rent || selectedRoomObj?.base_rent).toLocaleString('en-IN')}/mo
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Mobile {formData.phone} Verified</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
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
                  className="px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-indigo-600/30 transition transform hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loadingRegister ? 'Allocating Bed...' : 'Confirm & Book Bed'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </form>

        <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>Already registered? </span>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
