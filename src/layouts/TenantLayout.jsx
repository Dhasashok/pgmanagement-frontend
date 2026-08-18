import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BedDouble, CreditCard, History, Wrench, Megaphone, User,
  Bell, LogOut, Menu, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

const NAV_ITEMS = [
  { to: '/tenant/dashboard',        icon: Home,       label: 'My Dashboard' },
  { to: '/tenant/room',             icon: BedDouble,  label: 'My Room & Bed' },
  { to: '/tenant/payments',         icon: CreditCard, label: 'Pay Rent' },
  { to: '/tenant/payment-history',  icon: History,    label: 'Payment History' },
  { to: '/tenant/complaints',       icon: Wrench,     label: 'Maintenance' },
  { to: '/tenant/profile',          icon: User,       label: 'My Profile' },
];

export const TenantLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-200">
        <div className="w-8 h-8 rounded-xl bg-teal-gradient flex items-center justify-center shrink-0 shadow-teal">
          <BedDouble className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-neutral-900 leading-tight">Royal Orchid PG</p>
          <p className="text-[10px] text-neutral-400 font-medium">Resident Portal</p>
        </div>
      </div>

      {/* User Welcome */}
      <div className="px-4 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3 p-3 bg-primary-950/40 border border-primary-500/20 rounded-xl">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Tenant')}&background=0D9488&color=fff`}
            alt={user?.name}
            className="w-9 h-9 rounded-lg object-cover ring-2 ring-primary-200 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-neutral-800 truncate">{user?.name}</p>
            <p className="text-[10px] text-primary-600 font-medium">Active Resident</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="nav-icon w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-neutral-200 p-3">
        <button
          onClick={handleLogout}
          className="nav-item text-red-500 hover:bg-red-50 hover:text-red-600 w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="sidebar-glass hidden lg:flex flex-col w-56 shrink-0">
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
        <header className="bg-slate-950 border-b border-neutral-200 px-5 h-14 flex items-center justify-between shrink-0 shadow-card z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumbs portalLabel="Resident Portal" />
          </div>
          <button className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition">
            <Bell className="w-4 h-4" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-5 py-6 pb-24 lg:pb-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 inset-x-0 lg:hidden z-30 grid grid-cols-4 border-t border-slate-800 bg-slate-950/95 backdrop-blur px-2 py-2">
        {[
          { to: '/tenant/dashboard', icon: Home, label: 'Home' },
          { to: '/tenant/room', icon: BedDouble, label: 'Room' },
          { to: '/tenant/payments', icon: CreditCard, label: 'Payments' },
          { to: '/tenant/profile', icon: User, label: 'Profile' },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-semibold ${isActive ? 'text-primary-400' : 'text-slate-400'}`}>
            <Icon className="w-4 h-4" />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
