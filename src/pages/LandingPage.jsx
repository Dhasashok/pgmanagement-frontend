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
          setProperty(propRes.property);
        }
      } catch (err) {
        console.warn('Landing data fetch err:', err.message);
      }
    };
    loadInfo();
  }, []);

  const pgName = 'Royal Orchid PG';

  const facilities = [
    { icon: Wifi, title: '1 Gbps High-Speed Wi-Fi', desc: 'Seamless streaming, work-from-home reliability & low latency.' },
    { icon: ShieldCheck, title: '24/7 CCTV & Biometric Entry', desc: 'Secure fingerprint access with round-the-clock security staff.' },
    { icon: Coffee, title: 'Hygienic Chef Meals', desc: 'Delicious breakfast, lunch, and dinner cooked fresh daily.' },
    { icon: Sparkles, title: 'Daily Professional Housekeeping', desc: 'Rooms, bathrooms, and corridors sanitized and cleaned daily.' },
    { icon: Zap, title: '100% Power Backup', desc: 'Automatic diesel generator support for uninterrupted comfort.' },
    { icon: Tv, title: 'Rooftop Cafeteria & Lounge', desc: 'Smart TV, cozy workstation desks, and silent study zones.' },
  ];

  const houseRules = [
    { icon: Clock, title: 'Respect Quiet Hours', description: 'Please keep noise low during designated rest hours (10:30 PM - 6:00 AM).' },
    { icon: UsersRound, title: 'Visitor Safety Policy', description: 'Visitors must register at the reception and adhere to building rules.' },
    { icon: ReceiptText, title: 'Timely Rent Payment', description: 'Pay rent seamlessly by the due date using UPI/Card in the resident portal.' },
    { icon: BellRing, title: 'Clean Shared Spaces', description: 'Maintain cleanliness in dining, kitchen, and common lounge areas.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white pb-16 md:pb-0 font-sans">
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Building className="w-5 h-5" />
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                {pgName}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
            <a href="#facilities" className="hover:text-indigo-400 transition-colors">Amenities</a>
            <a href="#rules" className="hover:text-indigo-400 transition-colors">Rules</a>
            <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>
          </nav>

          {/* Header Action: Clean Sign In */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-sm"
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
                    { icon: Home, label: 'About', href: '#about' },
                    { icon: Sparkles, label: 'Amenities', href: '#facilities' },
                    { icon: FileText, label: 'House Rules', href: '#rules' },
                    { icon: Phone, label: 'Contact', href: '#contact' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-indigo-400" />
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
                    className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
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

      {/* Cinematic Full-Width Background Video Hero Section */}
      <section
        id="about"
        className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16"
      >
        {/* Full-width Background Video Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-20">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80"
            className="w-full h-full object-cover scale-105 transition-transform duration-1000 opacity-75"
            aria-hidden="true"
          >
            {/* Primary Expected Local Video Asset */}
            <source src="/videos/pg-hero.mp4" type="video/mp4" />
            {/* Smooth Cinematic Interior Sample Fallback */}
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-living-room-41525-large.mp4"
              type="video/mp4"
            />
            {/* Graceful Fallback Static Bedroom Image */}
            <img
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80"
              alt="Royal Orchid PG Bedroom"
              className="w-full h-full object-cover"
            />
          </video>
        </div>

        {/* Multi-tier Dark Transparent Gradient Overlay for Optimal Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60 -z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Centered Hero Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 my-auto py-8">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-[1.14] drop-shadow-md"
          >
            A Comfortable, Secure <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">
              PG Stay That Feels
            </span>{' '}
            Like Home
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-5 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow"
          >
            Royal Orchid is a modern, tech-enabled PG in Bengaluru featuring luxury air-conditioned rooms, hygienic chef meals, 1 Gbps optical fiber Wi-Fi, and 24/7 digital support.
          </motion.p>

          {/* Primary Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-7 flex items-center justify-center"
          >
            <Link
              to="/register"
              className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Explore Available Beds</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Compact Quick Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-12 sm:mt-14 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto"
          >
            <div className="p-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/70 backdrop-blur-md text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-black text-white">100%</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Power Backup</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/70 backdrop-blur-md text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">24/7</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Biometric Safety</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/70 backdrop-blur-md text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-black text-indigo-400">3 Meals</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Fresh Daily Food</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/70 backdrop-blur-md text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-black text-teal-400">1 Gbps</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Fiber Wi-Fi</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-16 bg-slate-900/40 border-y border-slate-800/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">Amenities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">World-Class Facilities Included</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{fac.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{fac.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* House Rules Section */}
      <section id="rules" className="py-16 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">Community</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">House Rules & Guidelines</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {houseRules.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white mb-1">{title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact Standard Modern Footer */}
      <footer id="contact" className="py-10 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-xs">
            {/* Column 1: Info */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Building className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-sm">
                  {pgName}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {property?.tagline || 'Modern premium PG accommodation with air-conditioned rooms, Wi-Fi, chef meals, and digital resident support.'}
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2.5">Quick Links</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#facilities" className="hover:text-white transition">Amenities</a></li>
                <li><a href="#rules" className="hover:text-white transition">House Rules</a></li>
                <li><Link to="/login" className="hover:text-white transition">Resident Login</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2.5">Contact</h4>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{property?.address || 'Sector 4, Silicon Valley Zone, Bengaluru'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{property?.contact_phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{property?.contact_email || 'royalorchidpg@gmail.com'}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} {pgName}. All rights reserved.</p>
            <p>PG Management System</p>
          </div>
        </div>
      </footer>

      {/* App-like Mobile Bottom Sticky Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-3 py-1.5">
        <div className="grid grid-cols-4 gap-1 text-center">
          <a
            href="#about"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'home' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </a>

          <a
            href="#facilities"
            onClick={() => setActiveTab('amenities')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'amenities' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px]">Amenities</span>
          </a>

          <a
            href="#rules"
            onClick={() => setActiveTab('rules')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'rules' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px]">Rules</span>
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
