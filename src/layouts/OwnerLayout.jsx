import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BedDouble, Building2, Users, Receipt,
  ShieldCheck, History, TrendingUp, DollarSign, Wrench, Megaphone,
  Settings, Bell, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Search, ChevronDown
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
  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-neutral-200 ${collapsed && !mobile ? 'justify-center px-3' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-teal-gradient flex items-center justify-center shrink-0 shadow-teal">
          <BedDouble className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="font-bold text-sm text-neutral-900 leading-tight">Royal Orchid PG</p>
            <p className="text-[10px] text-neutral-400 font-medium">Owner Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {(!collapsed || mobile) && (
              <p className="section-header mb-1">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => mobile && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''} ${collapsed && !mobile ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed && !mobile ? label : undefined}
                >
                  <Icon className="nav-icon w-4 h-4 shrink-0" />
                  {(!collapsed || mobile) && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className={`border-t border-neutral-200 p-3 ${collapsed && !mobile ? 'flex justify-center' : ''}`}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Owner')}&background=0D9488&color=fff&size=80`}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-neutral-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-800 truncate">{user?.name || 'PG Owner'}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`sidebar-glass hidden lg:flex flex-col shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}
      >
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-slate-800 border border-neutral-700 shadow-card flex items-center justify-center text-neutral-400 hover:text-primary-400 transition z-10 hidden lg:flex"
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
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 z-50 shadow-modal lg:hidden flex flex-col"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-slate-950 border-b border-neutral-200 px-3 sm:px-5 h-14 flex items-center justify-between shrink-0 shadow-card z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumbs portalLabel="Owner Portal" />
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            {/* Bell */}
            <button className="relative p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition">
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Avatar Dropdown */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <img
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Owner')}&background=0D9488&color=fff`}
                alt={user?.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-neutral-200"
              />
              <span className="hidden sm:block text-xs font-semibold text-neutral-700">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 py-4 sm:py-6 pb-24 lg:pb-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 inset-x-0 lg:hidden z-30 grid grid-cols-4 border-t border-slate-800 bg-slate-950/95 backdrop-blur px-2 py-2">
        {[
          { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Home' },
          { to: '/owner/rooms-availability', icon: BedDouble, label: 'Rooms' },
          { to: '/owner/tenants', icon: Users, label: 'Tenants' },
          { to: '/owner/rent-management', icon: Receipt, label: 'Rent' },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-semibold ${isActive ? 'text-primary-400' : 'text-slate-400'}`}>
            <Icon className="w-4 h-4" />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
