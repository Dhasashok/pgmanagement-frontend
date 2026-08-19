import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
  X,
  Home,
  FileText,
  User,
  ChevronRight,
  Navigation,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  BedDouble,
  Compass
} from 'lucide-react';
import api from '../services/api';

export const LandingPage = () => {
  const [property, setProperty] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay initiated with user interaction policy:', err.message);
      });
    }
  }, []);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const propRes = await api.get('/pg/property');
        if (propRes.success && propRes.property) {
          setProperty(propRes.property);
        }
      } catch (err) {
        console.warn('Landing data fetch err:', err.message);
      }
    };
    loadInfo();
  }, []);

  const pgName = 'Royal Orchid PG';
  const pgAddress = property?.address || 'Plot 42, Sector 4, Silicon Valley Tech Zone, Bengaluru, Karnataka 560103';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pgAddress + ' ' + pgName)}`;

  const facilities = [
    {
      icon: Wifi,
      title: '1 Gbps Optical Fiber Wi-Fi',
      desc: 'Ultra-low latency mesh coverage across all floors & rooms for WFH & gaming.',
      badge: 'High Speed',
      gradient: 'from-blue-500/20 to-indigo-500/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: Coffee,
      title: '3 Hygienic Chef Meals Daily',
      desc: 'Nutritious breakfast, lunch, and dinner prepared fresh with filtered water.',
      badge: 'Fresh Cooked',
      gradient: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20'
    },
    {
      icon: ShieldCheck,
      title: 'Biometric Access & 24/7 CCTV',
      desc: 'Fingerprint turnstiles, round-the-clock security warden, and full campus surveillance.',
      badge: '3-Tier Safety',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      icon: Sparkles,
      title: 'Daily Deep Housekeeping',
      desc: 'Rooms, en-suite bathrooms, and common corridors sanitized daily by dedicated staff.',
      badge: 'Sanitized',
      gradient: 'from-purple-500/20 to-pink-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20'
    },
    {
      icon: Zap,
      title: '100% Uninterrupted Power Backup',
      desc: 'Instant heavy-duty generator auto-switchover for fans, lights, and Wi-Fi routers.',
      badge: 'Zero Downtime',
      gradient: 'from-yellow-500/20 to-amber-500/10',
      iconColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/20'
    },
    {
      icon: Tv,
      title: 'Rooftop Cafeteria & Co-working Lounge',
      desc: 'Ergonomic workstations, high-speed power ports, 65" Smart TV, and chill-out terrace.',
      badge: 'Community',
      gradient: 'from-teal-500/20 to-cyan-500/10',
      iconColor: 'text-teal-400',
      borderColor: 'border-teal-500/20'
    }
  ];

  const houseRules = [
    {
      icon: Clock,
      title: 'Quiet Rest Hours',
      description: '10:30 PM – 6:00 AM dedicated silence policy to ensure uninterrupted study and sleep.',
      tag: '10:30 PM - 6:00 AM'
    },
    {
      icon: UsersRound,
      title: 'Visitor Safety Registration',
      description: 'Day visitors must verify at front reception. Overnight stays require prior warden approval.',
      tag: 'Safety First'
    },
    {
      icon: ReceiptText,
      title: 'Digital Rent Settlements',
      description: 'Convenient 1-click rent clearance via UPI, Card, or NetBanking before the 5th of every month.',
      tag: 'Auto Receipts'
    },
    {
      icon: BellRing,
      title: 'Clean Common Spaces',
      description: 'Keep dining hall, rooftop workstations, and gym areas tidy for your fellow residents.',
      tag: 'Community Care'
    }
  ];

  const nearbyLocations = [
    { name: 'Metro Station', dist: '500m', time: '6 mins walk' },
    { name: 'Tech Park / SEZ', dist: '1.2 km', time: '4 mins drive' },
    { name: 'Multi-speciality Hospital', dist: '1.8 km', time: '6 mins drive' },
    { name: 'Supermarket & Food Court', dist: '200m', time: '2 mins walk' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white pb-20 md:pb-0 font-sans">
      {/* Standard Clean Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition flex items-center justify-center cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Building className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                {pgName}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-300">
            <a href="#about" className="hover:text-teal-400 transition-colors">Overview</a>
            <a href="#facilities" className="hover:text-teal-400 transition-colors">Amenities</a>
            <a href="#rules" className="hover:text-teal-400 transition-colors">House Rules</a>
            <a href="#location" className="hover:text-teal-400 transition-colors">Map & Location</a>
          </nav>

          {/* Header Action: Clean Sign In */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white">
                    {pgName}
                  </span>
                </div>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-5 flex-1">
                <div className="space-y-1">
                  {[
                    { icon: Home, label: 'Overview', href: '#about' },
                    { icon: Sparkles, label: 'Amenities', href: '#facilities' },
                    { icon: FileText, label: 'House Rules', href: '#rules' },
                    { icon: MapPin, label: 'Map & Location', href: '#location' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-teal-400" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                      </a>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <Link
                    to="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                  >
                    <User className="w-4 h-4" />
                    <span>Resident & Owner Sign In</span>
                  </Link>
                </div>
              </div>

              <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
                © {new Date().getFullYear()} {pgName}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cinematic Full-Width Video Hero Section */}
      <section
        id="about"
        className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-12"
      >
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            ref={videoRef}
            src="https://vjs.zencdn.net/v/oceans.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80"
            className="w-full h-full object-cover opacity-80"
            aria-hidden="true"
          >
            <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70 z-[1]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none z-[1]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Premium PG Stay in Bengaluru
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-[1.12]"
          >
            Comfortable, Luxury Stay <br />
            <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              That Truly Feels Like Home.
            </span>
          </motion.h1>

          <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tech-enabled co-living space featuring air-conditioned rooms, hygienic chef meals, 1 Gbps fiber Wi-Fi, biometric security, and digital portal support.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"
            >
              <span>Explore Available Beds</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#location"
              className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>View Location</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-4xl mx-auto">
            {[
              { num: '1 Gbps', label: 'Optical Fiber Wi-Fi', color: 'text-teal-400' },
              { num: '3 Meals', label: 'Fresh Daily Food', color: 'text-amber-400' },
              { num: '24/7', label: 'Biometric Safety', color: 'text-emerald-400' },
              { num: '100%', label: 'Power Backup', color: 'text-indigo-400' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 sm:p-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/80 backdrop-blur-md text-center shadow-lg">
                <div className={`text-lg sm:text-2xl font-black ${stat.color}`}>{stat.num}</div>
                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMENITIES SECTION (Modern Bento Grid with visual accents) */}
      <section id="facilities" className="py-14 sm:py-18 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-1">
              Top-Tier Amenities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              World-Class Facilities Included
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Everything you need for productive work, healthy living, and peaceful rest.
            </p>
          </div>

          {/* 2-Column Responsive Grid on Mobile & 3-Column on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b ${fac.gradient} bg-slate-900/90 border ${fac.borderColor} p-4 sm:p-5 transition-all duration-200 hover:border-slate-600 shadow-lg`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 ${fac.iconColor} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-slate-300 border border-slate-800">
                      {fac.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-white mb-1 tracking-tight">
                    {fac.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {fac.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOUSE RULES SECTION (Refined Community Standards) */}
      <section id="rules" className="py-14 sm:py-16 bg-slate-900/40 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
              Community Culture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              House Rules & Guidelines
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Clear guidelines that guarantee comfort, safety, and mutual respect for all residents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {houseRules.map(({ icon: Icon, title, description, tag }) => (
              <div
                key={title}
                className="p-4 sm:p-5 rounded-2xl border border-slate-800/90 bg-slate-950/80 hover:border-slate-700 transition space-y-2 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {tag}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white pt-1">{title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW MAP & LOCATION SECTION */}
      <section id="location" className="py-14 sm:py-18 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-1">
              Prime Location
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Find Us & Surrounding Landmarks
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Centrally located in Bengaluru with instant access to tech parks, metro, hospitals, and markets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left: Interactive Dark Google Map */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 min-h-[300px] sm:min-h-[380px] relative">
              <iframe
                title="Royal Orchid PG Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124443.43542385966!2d77.5838!3d12.9352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '320px', filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Floating Directions Badge */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {property?.address || 'Sector 4, Bengaluru'}
                  </span>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <span>Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Right: Key Proximity Landmarks & Quick Contact */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span>Proximity & Connectivity</span>
                </div>

                <div className="space-y-2.5">
                  {nearbyLocations.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-indigo-300">{item.dist}</span>
                        <span className="text-[10px] text-slate-400 block">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Booking Inquiries Card */}
              <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-3">
                <div>
                  <h4 className="text-sm font-black text-white">Have questions or want a visit?</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Schedule a physical room tour with our PG warden.</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/919876543210?text=Hi,%20I%20am%20interested%20in%20checking%20room%20availability%20at%20Royal%20Orchid%20PG."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Us</span>
                  </a>

                  <a
                    href="tel:+919876543210"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODERN FOOTER */}
      <footer className="py-10 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-xs">
            {/* Column 1: Info */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-sm">
                  {pgName}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {property?.tagline || 'Modern premium PG accommodation with air-conditioned rooms, optical fiber Wi-Fi, chef meals, and digital resident support.'}
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2.5">Quick Links</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#about" className="hover:text-teal-400 transition">Overview</a></li>
                <li><a href="#facilities" className="hover:text-teal-400 transition">Amenities</a></li>
                <li><a href="#rules" className="hover:text-teal-400 transition">House Rules</a></li>
                <li><a href="#location" className="hover:text-teal-400 transition">Map & Location</a></li>
                <li><Link to="/login" className="hover:text-teal-400 transition">Resident Login</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2.5">Contact</h4>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{property?.address || 'Sector 4, Silicon Valley Zone, Bengaluru'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{property?.contact_phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{property?.contact_email || 'royalorchidpg@gmail.com'}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} {pgName}. All rights reserved.</p>
            <p>Smart PG Management Portal</p>
          </div>
        </div>
      </footer>

      {/* Floating Glassmorphic Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl px-3 py-1.5">
        <div className="grid grid-cols-4 gap-1 text-center">
          <a
            href="#about"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'home' ? 'text-teal-400 font-bold bg-teal-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </a>

          <a
            href="#facilities"
            onClick={() => setActiveTab('amenities')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'amenities' ? 'text-teal-400 font-bold bg-teal-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px]">Amenities</span>
          </a>

          <a
            href="#location"
            onClick={() => setActiveTab('location')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'location' ? 'text-teal-400 font-bold bg-teal-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-[10px]">Location</span>
          </a>

          <Link
            to="/login"
            className="flex flex-col items-center justify-center py-1 text-indigo-400 font-bold transition"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
