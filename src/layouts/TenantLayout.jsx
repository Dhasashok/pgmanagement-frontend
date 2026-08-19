import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BedDouble, CreditCard, History, Wrench, Megaphone, User,
  Bell, LogOut, Menu, ChevronRight, X, Sparkles, CheckCircle2, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import api from '../services/api';

const NAV_ITEMS = [
  { to: '/tenant/dashboard',        icon: Home,       label: 'My Dashboard' },
  { to: '/tenant/room',             icon: BedDouble,  label: 'My Room & Bed' },
  { to: '/tenant/payments',         icon: CreditCard, label: 'Pay Rent' },
  { to: '/tenant/payment-history',  icon: History,    label: 'Payment History' },
  { to: '/tenant/complaints',       icon: Wrench,     label: 'Maintenance' },
  { to: '/tenant/announcements',    icon: Megaphone,  label: 'Announcements' },
  { to: '/tenant/profile',          icon: User,       label: 'My Profile' },
];

export const TenantLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        if (res.success && res.announcements) {
          setNotices(res.announcements);
          setUnreadCount(res.announcements.length);
        }
      } catch (err) {
        console.warn('Failed to load notices for bell:', err.message);
      }
    };
    fetchAnnouncements();
  }, []);

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
          <BedDouble className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-tight">Royal Orchid PG</p>
          <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Resident Portal</p>
        </div>
      </div>

      {/* User Welcome */}
      <div className="px-4 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Tenant')}&background=0D9488&color=fff`}
            alt={user?.name}
            className="w-9 h-9 rounded-lg object-cover ring-2 ring-teal-500/30 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Resident'}</p>
            <p className="text-[10px] text-teal-400 font-medium">Active Resident</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              isActive
                ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-800/80 bg-slate-950">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 z-50 shadow-2xl lg:hidden flex flex-col border-r border-slate-800"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-slate-950/90 border-b border-slate-800/80 px-5 h-14 flex items-center justify-between shrink-0 backdrop-blur-md z-30 relative">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumbs portalLabel="Resident Portal" />
          </div>

          <div className="relative">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              data-testid="notifications-bell"
              aria-label="View Announcements & Notifications"
              className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white border border-slate-800/80 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-slate-950 text-[9px] font-black flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications / Announcements Dropdown Panel */}
            <AnimatePresence>
              {bellOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setBellOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-extrabold text-white">Noticeboard & Announcements</span>
                      </div>
                      <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                        {notices.length} Notices
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {notices.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No active announcements.</p>
                      ) : (
                        notices.map((n) => (
                          <div
                            key={n.id}
                            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-1 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                n.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                              }`}>
                                {n.priority || 'General'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white">{n.title}</h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{n.content || n.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                      <Link
                        to="/tenant/announcements"
                        onClick={() => setBellOpen(false)}
                        className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                      >
                        <span>Open Noticeboard Page</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => setBellOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 lg:hidden z-30 grid grid-cols-5 border-t border-slate-800 bg-slate-950/95 backdrop-blur px-2 py-2">
        {[
          { to: '/tenant/dashboard', icon: Home, label: 'Home' },
          { to: '/tenant/room', icon: BedDouble, label: 'Room' },
          { to: '/tenant/payments', icon: CreditCard, label: 'Pay' },
          { to: '/tenant/announcements', icon: Megaphone, label: 'Notices' },
          { to: '/tenant/profile', icon: User, label: 'Profile' },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-semibold transition ${
              isActive ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default TenantLayout;
