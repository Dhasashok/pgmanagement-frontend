import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building,
  Wifi,
  ShieldCheck,
  Coffee,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Tv,
  Zap,
  Clock,
  UsersRound,
  ReceiptText,
  BellRing,
  CheckCircle,
  CreditCard,
  MessageSquare,
  BedDouble,
  Menu,
  X,
  Home,
  Compass,
  FileText,
  User,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

export const LandingPage = () => {
  const [property, setProperty] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const propRes = await api.get('/pg/property');
        if (propRes.success && propRes.property) {
          const cleanProp = {
            ...propRes.property,
            name: (propRes.property.name || 'Royal Orchid Luxury PG').replace(/\s*&\s*co-living/gi, '').replace(/co-living/gi, '').trim() || 'Royal Orchid Luxury PG',
            tagline: (propRes.property.tagline || 'Experience premium PG stay with furnished AC rooms, hi-speed Wi-Fi, chef meals & digital management.').replace(/co-living/gi, 'PG stay')
          };
          setProperty(cleanProp);
        }
      } catch (err) {
        console.warn('Landing data fetch err:', err.message);
      }
    };
    loadInfo();
  }, []);

  const cleanPgName = (property?.name || 'Royal Orchid Luxury PG').replace(/\s*&\s*co-living/gi, '').replace(/co-living/gi, '').trim() || 'Royal Orchid Luxury PG';

  const facilities = [
    { icon: Wifi, title: '1 Gbps High Speed Wi-Fi', desc: 'Seamless streaming, zero lag, & work from home reliability.' },
    { icon: ShieldCheck, title: '24/7 CCTV & Biometric Entry', desc: 'Secure fingerprint access with round-the-clock security personnel.' },
    { icon: Coffee, title: 'Hygienic Chef Meals', desc: 'Delicious breakfast, lunch, and dinner cooked fresh every single day.' },
    { icon: Sparkles, title: 'Daily Professional Housekeeping', desc: 'Rooms, bathrooms, and corridors sanitized and dusted daily.' },
    { icon: Zap, title: '100% Power Backup', desc: 'Heavy-duty automatic diesel generator support for uninterrupted comfort.' },
    { icon: Tv, title: 'Rooftop Cafeteria & Lounge', desc: '65" 4K Smart TV, cozy workstation desks, and dedicated silent study zone.' },
  ];

  const houseRules = [
    { icon: Clock, title: 'Respect quiet hours', description: 'Please keep noise low during designated rest hours (10:30 PM - 6:00 AM).' },
    { icon: UsersRound, title: 'Visitor safety', description: 'Visitors must register at the entrance desk and follow the PG visitor policy.' },
    { icon: ReceiptText, title: 'Timely online rent', description: 'Pay rent seamlessly by the due date using Razorpay/UPI in the resident portal.' },
    { icon: BellRing, title: 'Keep shared spaces clean', description: 'Help maintain a hygienic home by using dining and common areas responsibly.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white pb-16 md:pb-0">
      {/* Prominent Full-Width Top Header (Spacious with no scroll gap) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/95 border-b border-slate-800/90 backdrop-blur-2xl shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Left Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center justify-center cursor-pointer shadow-md"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-lg sm:text-xl tracking-tight text-white block leading-tight">
                  {cleanPgName}
                </span>
                <span className="text-[11px] text-indigo-400 font-extrabold tracking-wider uppercase block mt-0.5">
                  Luxury PG Stay & Accommodation
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
            <a href="#facilities" className="hover:text-indigo-400 transition-colors">Facilities</a>
            <a href="#tour" className="hover:text-indigo-400 transition-colors">Virtual Tour</a>
            <a href="#rules" className="hover:text-indigo-400 transition-colors">House Rules</a>
            <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>
          </nav>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/80 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <span>Book Bed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Left Slide-out Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block leading-tight">
                      {cleanPgName}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                      PG Stay Platform
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-5 space-y-6 flex-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                    Explore & Overview
                  </span>
                  <div className="space-y-1">
                    {[
                      { icon: Home, label: 'About Royal Orchid', href: '#about' },
                      { icon: Sparkles, label: 'Facilities & Amenities', href: '#facilities' },
                      { icon: Compass, label: 'Virtual Room Tour', href: '#tour' },
                      { icon: FileText, label: 'House Rules & Timings', href: '#rules' },
                      { icon: Phone, label: 'Contact & Location', href: '#contact' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-indigo-400" />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Portals Access */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                    Portals & Booking
                  </span>
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>Resident & Owner Sign In</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <BedDouble className="w-4 h-4 text-emerald-400" />
                        <span>Book a Room / Bed</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Quick WhatsApp Connect */}
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <MessageSquare className="w-4 h-4" />
                    <span>Instant Support Desk</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Have questions about rent or joining date? Chat with our PG manager directly.</p>
                  <a
                    href="https://wa.me/919876543210?text=Hi%20Royal%20Orchid%20PG%2C%20I%20have%20an%20inquiry."
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-center rounded-xl text-xs transition"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-500 flex items-center justify-between">
                <span>© {new Date().getFullYear()} {cleanPgName}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Systems Live
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="about" className="relative pt-36 pb-20 lg:pt-48 lg:pb-28 overflow-hidden">
        {/* Background Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Premium PG Accommodation for Students & Tech Professionals</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]"
          >
            A Comfortable, Secure <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">
              PG Stay That Feels
            </span>{' '}
            Like Home
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Royal Orchid is a modern, tech-enabled PG in Bengaluru featuring luxury air-conditioned rooms, hygienic chef meals, 1 Gbps optical fiber Wi-Fi, and 24/7 digital support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <Link
              to="/register"
              className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Explore Available Beds</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition flex items-center gap-2 shadow-md"
            >
              <span>Resident Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Animated Interactive PG Tour Video Showcase in Hero */}
          <section id="tour" className="mt-16 relative max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl group"
            >
              {/* Embedded HD PG Ambience Video */}
              <div className="relative h-72 sm:h-96 md:h-[460px] w-full overflow-hidden bg-slate-950">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80"
                  className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition duration-700 scale-105 group-hover:scale-100"
                >
                  <source
                    src="https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-living-room-41525-large.mp4"
                    type="video/mp4"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80"
                    alt="Royal Orchid PG"
                    className="w-full h-full object-cover"
                  />
                </video>

                {/* Video Dark Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50 pointer-events-none" />
              </div>

              {/* Floating Live Metric Cards on Video */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2.5 z-20">
                <div className="glass-panel px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md flex items-center gap-2 shadow-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-white">Live Bed Availability Matrix Active</span>
                </div>

                <div className="hidden sm:flex items-center gap-2 glass-panel px-3.5 py-2 rounded-xl bg-slate-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow-lg">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Razorpay Instant Rent & Auto-Receipt</span>
                </div>
              </div>

              {/* Floating Bottom Badges */}
              <div className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-6 flex flex-wrap items-center justify-between gap-3 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 backdrop-blur-md">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-white">3-Tier Biometric & CCTV Security</p>
                    <p className="text-[10px] text-slate-400">Guarded entry with verified digital resident logs</p>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5"
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>Select Room & Bed</span>
                </Link>
              </div>
            </motion.div>
          </section>

          {/* Quick Metrics Strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-2xl border border-slate-800/90 bg-slate-900/60">
              <div className="text-2xl lg:text-3xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Power Backup & Wi-Fi</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800/90 bg-slate-900/60">
              <div className="text-2xl lg:text-3xl font-black text-emerald-400">24/7</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Biometric Safety & Staff</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800/90 bg-slate-900/60">
              <div className="text-2xl lg:text-3xl font-black text-indigo-400">3 Meals</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Nutritious Chef Food Daily</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800/90 bg-slate-900/60">
              <div className="text-2xl lg:text-3xl font-black text-teal-400">1 Gbps</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Ultra High-Speed Internet</div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-24 bg-slate-900/40 border-y border-slate-800/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-2">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">World-Class Facilities Included</h2>
            <p className="mt-3 text-sm text-slate-400">Experience effortless living designed for tech professionals and students.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-6 rounded-3xl border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 group bg-slate-900/70"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-300 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{fac.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{fac.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* House Rules */}
      <section id="rules" className="py-24 border-b border-slate-800/70 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">A Respectful Community</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">House Rules & Guidelines</h2>
            <p className="mt-3 text-sm text-slate-400">Simple guidelines that help every resident enjoy a safe, comfortable, and welcoming PG stay.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {houseRules.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass-card p-5 rounded-3xl border border-slate-800/90 bg-slate-900/60">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned Sleek Multi-Column Footer */}
      <footer id="contact" className="pt-20 pb-16 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            {/* PG Bio & Identity */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-white text-base tracking-tight block">
                    {cleanPgName}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    Smart PG Accommodation
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {property?.tagline || 'Experience premium PG stay with furnished AC rooms, high-speed optical Wi-Fi, fresh chef meals, and digital management.'}
              </p>

              <div className="space-y-2 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{property?.address || 'Plot 42, Silicon Valley Tech Zone, Sector 4, Bengaluru'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{property?.contact_phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{property?.contact_email || 'royalorchidpg@gmail.com'}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent('Hi Royal Orchid PG, I want to inquire about room availability and rent.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp Support</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#about" className="hover:text-white transition">About Royal Orchid</a></li>
                <li><a href="#facilities" className="hover:text-white transition">Amenities & Facilities</a></li>
                <li><a href="#tour" className="hover:text-white transition">Virtual Room Tour</a></li>
                <li><a href="#rules" className="hover:text-white transition">House Rules & Timing</a></li>
                <li><Link to="/register" className="hover:text-white transition">Book a Bed Online</Link></li>
              </ul>
            </div>

            {/* Resident & Owner Portals */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals & Access</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1">
                    Resident Portal Sign In <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-teal-400 font-semibold hover:text-teal-300 flex items-center gap-1">
                    Owner / Manager Login <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
                <li><span className="text-slate-500">Razorpay Direct Pay</span></li>
                <li><span className="text-slate-500">Maintenance SOS Desk</span></li>
              </ul>
            </div>

            {/* Safety & System Status */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">System & Safety</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Systems Operational</span>
                  </div>
                  <p className="text-[10px] text-slate-400">TiDB Cloud DB & Razorpay API Live</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} {cleanPgName}. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span>Powered by TiDB Cloud, Vite React & Razorpay.</span>
            </p>
          </div>
        </div>
      </footer>

      {/* App-like Mobile Bottom Sticky Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 shadow-2xl">
        <div className="grid grid-cols-5 gap-1">
          <a
            href="#about"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition ${
              activeTab === 'home' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </a>

          <a
            href="#facilities"
            onClick={() => setActiveTab('amenities')}
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition ${
              activeTab === 'amenities' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px]">Amenities</span>
          </a>

          <a
            href="#tour"
            onClick={() => setActiveTab('tour')}
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition ${
              activeTab === 'tour' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px]">Tour</span>
          </a>

          <a
            href="#rules"
            onClick={() => setActiveTab('rules')}
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition ${
              activeTab === 'rules' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px]">Rules</span>
          </a>

          <Link
            to="/login"
            className="flex flex-col items-center justify-center gap-1 py-1 rounded-xl text-teal-400 hover:text-teal-300 font-bold transition"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
