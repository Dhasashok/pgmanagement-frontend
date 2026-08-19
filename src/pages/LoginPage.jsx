import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedIn = await login(email.trim(), password);
      const role = loggedIn?.role || loggedIn?.user?.role;
      showSuccess('Login successful!');
      if (role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      showError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (type) => {
    const creds = type === 'owner'
      ? { email: 'owner@pgmaster.com', password: 'admin123' }
      : { email: 'rahul.patil@example.com', password: 'tenant123' };
    setEmail(creds.email);
    setPassword(creds.password);
    setLoading(true);
    try {
      const loggedIn = await login(creds.email, creds.password);
      const role = loggedIn?.role || loggedIn?.user?.role || type;
      showSuccess(`Signed in as ${role === 'owner' ? 'Owner / Admin' : 'Resident'}`);
      if (role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      showError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex bg-slate-950">
      {/* Top Left Floating Back to Home button for desktop & mobile */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold backdrop-blur transition shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Left: Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 border-r border-slate-800/80">
        {/* Subtle Radial Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full pt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <BedDouble className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-white font-extrabold text-lg tracking-tight block">Royal Orchid PG</span>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Luxury PG Stay</span>
            </div>
          </div>

          <div className="space-y-8 my-auto">
            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider inline-block mb-3">
                Smart PG Platform
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                Effortless PG <br />
                <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Management.
                </span>
              </h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-sm">
                Smart digital resident & property management portal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 max-w-md">
              {[
                { label: 'Beds Capacity', value: '150+', color: 'text-indigo-400' },
                { label: 'Monthly Revenue', value: '₹8L+', color: 'text-emerald-400' },
                { label: 'Happy Residents', value: '120+', color: 'text-teal-400' },
                { label: 'System Uptime', value: '99.9%', color: 'text-purple-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-lg hover:border-slate-700 transition">
                  <p className={`font-black text-2xl ${stat.color}`}>{stat.value}</p>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Royal Orchid PG</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden pt-16 sm:pt-6">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6 glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10"
        >
          {/* Mobile Logo & Back */}
          <div className="flex items-center justify-between lg:hidden mb-2">
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <BedDouble className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-xs">Royal Orchid</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-xs text-slate-400 mt-1">Sign in to your account</p>
          </div>

          {/* Quick Demo Login */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2.5">
            <p className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-400" /> Demo Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('owner')}
                disabled={loading}
                className="btn btn-primary text-xs py-2 px-3 justify-center rounded-xl font-bold"
              >
                Sign In as Owner
              </button>
              <button
                type="button"
                onClick={() => quickLogin('tenant')}
                disabled={loading}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                Sign In as Tenant
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-slate-500 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} data-testid="login-form" className="space-y-4">
            <div className="form-group">
              <label htmlFor="email" className="form-label text-xs font-semibold text-slate-300">
                Email Address <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                data-testid="email"
                aria-label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label text-xs font-semibold text-slate-300">
                Password <span className="text-rose-400 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  data-testid="password"
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-950 transition flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center">
            New to Royal Orchid?{' '}
            <Link to="/register" className="text-teal-400 font-semibold hover:text-teal-300 transition">
              Register Here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
