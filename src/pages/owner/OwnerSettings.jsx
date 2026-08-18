import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Building,
  QrCode,
  CreditCard,
  Save,
  CheckCircle
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

export const OwnerSettings = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_phone: '',
    contact_email: '',
    upi_id: '',
    qr_code_url: '',
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    rent_due_day: 5,
    notice_period_days: 30
  });

  const loadPropertySettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pg/property');
      if (res.success && res.property) {
        setFormData(res.property);
      }
    } catch (err) {
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertySettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/pg/property', formData);
      if (res.success) {
        showSuccess('Property and Payment Settings saved successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading settings..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>Property & Payment Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage property profile, contact info, and payment QR codes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PG Profile */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building className="w-4 h-4" />
            <span>Property Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PG Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Karnataka"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="560100"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Contact Phone</label>
              <input
                type="text"
                required
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* UPI & QR Code Settings */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <QrCode className="w-4 h-4" />
            <span>UPI & Payment QR Code</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary UPI ID (VPA)</label>
              <input
                type="text"
                value={formData.upi_id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    upi_id: val,
                    qr_code_url: val
                      ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${val}&pn=${encodeURIComponent(
                          formData.name || 'PG'
                        )}&cu=INR`
                      : formData.qr_code_url
                  });
                }}
                placeholder="e.g. royalorchid@okhdfcbank"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Displayed on resident payment screens for QR scanning.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">QR Code Image URL</label>
              <input
                type="text"
                value={formData.qr_code_url || ''}
                onChange={(e) => setFormData({ ...formData, qr_code_url: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* QR Preview */}
          {formData.qr_code_url && (
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center gap-4">
              <img
                src={formData.qr_code_url}
                alt="PG Payment QR"
                className="w-20 h-20 rounded-xl bg-white p-1"
              />
              <div>
                <p className="text-xs font-bold text-white">Active Payment QR Code</p>
                <p className="text-[11px] text-slate-400">Residents can scan this using Google Pay, PhonePe, or Paytm.</p>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold block mt-1">{formData.upi_id}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bank Details & Terms */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <CreditCard className="w-4 h-4" />
            <span>Bank Account & Rental Policies</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bank_name || ''}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="HDFC Bank"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bank_account_number || ''}
                onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                placeholder="50100234981123"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.bank_ifsc || ''}
                onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value })}
                placeholder="HDFC0001234"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Rent Due Day</label>
              <input
                type="number"
                min="1"
                max="28"
                value={formData.rent_due_day || 5}
                onChange={(e) => setFormData({ ...formData, rent_due_day: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Period (Days)</label>
              <input
                type="number"
                min="7"
                max="90"
                value={formData.notice_period_days || 30}
                onChange={(e) => setFormData({ ...formData, notice_period_days: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
