import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, CheckCircle, PieChart as PieIcon } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import api from '../../services/api';

export const FinancialDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState(null);
  const [summary, setSummary] = useState(null);

  const loadFinancials = async () => {
    try {
      setLoading(true);
      const [finRes, sumRes] = await Promise.all([
        api.get('/analytics/financial'),
        api.get('/analytics/dashboard-summary')
      ]);

      if (finRes.success) setFinanceData(finRes);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Compiling monthly financial intelligence..." />;
  }

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  const paymentMethodColors = {
    upi_qr: '#6366f1',
    online_gateway: '#10b981',
    cash: '#f59e0b',
    bank_transfer: '#38bdf8'
  };

  const methodPieData = (financeData?.paymentMethods || []).map(m => ({
    name: m.payment_method.replace('_', ' ').toUpperCase(),
    value: Number(m.total_amount) || 0,
    color: paymentMethodColors[m.payment_method] || '#6366f1'
  })).filter(m => m.value > 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <DollarSign className="w-6 h-6 text-emerald-400" />
          <span>Monthly Financial Intelligence & Revenue</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed revenue collection ledger, collection rates, overdue receivables, and payment channel breakdown.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Collected Revenue"
          value={formatCurrency(summary?.monthly_revenue)}
          subtitle="Cleared Receipts This Month"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Expected Total Rent"
          value={formatCurrency(summary?.expected_rent)}
          subtitle="Total Active Billings"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Pending Receivables"
          value={formatCurrency(summary?.pending_rent)}
          subtitle="Due This Month"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Collection Rate"
          value={`${summary?.collection_rate || 0}%`}
          subtitle="Target Efficiency"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Main Charts: Revenue Trend & Payment Channel Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expected vs Collected Bar Chart (8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Expected vs Collected Revenue (₹)</h3>
              <p className="text-xs text-slate-400">Monthly billing vs actual realized income</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData?.revenueTrend || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="expected" name="Expected Rent" fill="#4338ca" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collected" name="Collected Income" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Donut (4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Payment Method Share</h3>
            <p className="text-xs text-slate-400">Revenue split across channels</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {methodPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {methodPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No payment data recorded</div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {methodPieData.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></span>
                  <span className="text-slate-300">{m.name}</span>
                </div>
                <span className="font-bold text-white">{formatCurrency(m.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Trend Area Curve */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">6-Month Collection Velocity & Inflow</h3>
          <p className="text-xs text-slate-400">Trend of realized payments over past 6 billing cycles</p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financeData?.revenueTrend || []} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Collected Income']}
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCollected)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
