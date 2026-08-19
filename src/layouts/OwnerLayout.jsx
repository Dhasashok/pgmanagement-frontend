import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BedDouble, Building2, Users, Receipt,
  ShieldCheck, History, TrendingUp, DollarSign, Wrench, Megaphone,
  Settings, Bell, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Search, Plus, Sparkles, UserPlus, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { GlobalSearch } from '../components/common/GlobalSearch';

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { to: '/owner/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/owner/rooms-availability',  icon: BedDouble,       label: 'Room Availability' },
    ]
  },
  {
    label: 'Tenants',
    items: [
      { to: '/owner/tenants',             icon: Users,           label: 'Tenant Directory' },
      { to: '/owner/building-structure',  icon: Building2,       label: 'Building Manager' },
      { to: '/owner/tenant-history',      icon: History,         label: 'Tenant History' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: '/owner/rent-management',     icon: Receipt,         label: 'Rent Management' },
      { to: '/owner/payment-verification',icon: ShieldCheck,     label: 'Verify Payments' },
      { to: '/owner/financial-dashboard', icon: DollarSign,      label: 'Financial Reports' },
      { to: '/owner/occupancy-analytics', icon: TrendingUp,      label: 'Occupancy Analytics' },
    ]
  },
  {
    label: 'Communication & Settings',
    items: [
      { to: '/owner/complaints',          icon: Wrench,          label: 'Maintenance Tickets' },
      { to: '/owner/settings',            icon: Settings,        label: 'Settings' },
    ]
  }
];

export const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const { notifications } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed && !mobile ? 'justify-center px-3' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
          <BedDouble className="w-4 h-4 text-slate-950 font-bold" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="font-bold text-sm text-white leading-tight">Royal Orchid PG</p>
            <p className="text-[10px] text-teal-400 font-semibold tracking-wide">Owner Control</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {(!collapsed || mobile) && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => mobile && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    } ${collapsed && !mobile ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed && !mobile ? label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {(!collapsed || mobile) && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className={`border-t border-slate-800 p-3 ${collapsed && !mobile ? 'flex justify-center' : ''}`}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Owner')}&background=0D9488&color=fff&size=80`}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'PG Owner'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 border-r border-slate-800/80 bg-slate-950 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 shadow-card flex items-center justify-center text-slate-400 hover:text-teal-400 transition z-10 hidden lg:flex"
          style={{ position: 'sticky', alignSelf: 'flex-end', marginTop: '-48px', marginRight: '-12px' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 z-50 shadow-2xl lg:hidden flex flex-col border-r border-slate-800"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Quick Action Modal Sheet (for Center Mobile + Button) */}
      <AnimatePresence>
        {quickActionOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickActionOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 z-50 lg:hidden shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Plus className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Quick Actions</p>
                    <p className="text-[11px] text-slate-400">Direct operations shortcut</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickActionOpen(false)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  {
                    title: 'Add Resident',
                    desc: 'New tenant check-in',
                    icon: UserPlus,
                    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                    path: '/owner/tenants'
                  },
                  {
                    title: 'Collect Rent',
                    desc: 'Log offline / online cash',
                    icon: CreditCard,
                    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    path: '/owner/rent-management'
                  },
                  {
                    title: 'Bed Matrix',
                    desc: 'Allocate vacant beds',
                    icon: BedDouble,
                    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
                    path: '/owner/rooms-availability'
                  },
                  {
                    title: 'Verify Proofs',
                    desc: 'Approve tenant payments',
                    icon: ShieldCheck,
                    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    path: '/owner/payment-verification'
                  }
                ].map(({ title, desc, icon: Icon, color, path }) => (
                  <button
                    key={path}
                    onClick={() => {
                      setQuickActionOpen(false);
                      navigate(path);
                    }}
                    className={`flex flex-col text-left p-3.5 rounded-2xl border ${color} active:scale-95 transition`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <p className="text-xs font-bold text-white">{title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-slate-950 border-b border-slate-800/80 px-3 sm:px-6 h-14 flex items-center justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800/80 transition"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Property Badge */}
            <div className="flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span className="text-xs font-bold text-white truncate max-w-[130px]">
                Royal Orchid
              </span>
            </div>

            <div className="hidden lg:block">
              <Breadcrumbs portalLabel="Owner Portal" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/owner/complaints')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar */}
            <div
              onClick={() => navigate('/owner/settings')}
              className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer"
            >
              <img
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Owner')}&background=0D9488&color=fff`}
                alt={user?.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover ring-1 ring-slate-700"
              />
              <span className="hidden md:block text-xs font-semibold text-slate-200">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-28 lg:pb-8 page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* FLOATING GLASSMORPHIC MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-3 inset-x-3 sm:inset-x-6 lg:hidden z-40 flex items-center justify-around bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 shadow-2xl rounded-2xl py-1.5 px-1">
        <NavLink
          to="/owner/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl py-1.5 px-3 text-[10px] font-bold transition ${
              isActive
                ? 'text-teal-400 bg-teal-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/owner/rooms-availability"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl py-1.5 px-3 text-[10px] font-bold transition ${
              isActive
                ? 'text-teal-400 bg-teal-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <BedDouble className="w-4 h-4" />
          <span>Rooms</span>
        </NavLink>

        {/* Center Quick Action Floating Trigger */}
        <button
          onClick={() => setQuickActionOpen(true)}
          className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border-2 border-slate-950 active:scale-90 transition"
          title="Quick Action"
        >
          <Plus className="w-5 h-5 font-black" />
        </button>

        <NavLink
          to="/owner/tenants"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl py-1.5 px-3 text-[10px] font-bold transition ${
              isActive
                ? 'text-teal-400 bg-teal-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Users className="w-4 h-4" />
          <span>Tenants</span>
        </NavLink>

        <NavLink
          to="/owner/rent-management"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl py-1.5 px-3 text-[10px] font-bold transition ${
              isActive
                ? 'text-teal-400 bg-teal-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Receipt className="w-4 h-4" />
          <span>Rent</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default OwnerLayout;
