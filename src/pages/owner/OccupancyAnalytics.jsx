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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { PieChart as PieIcon, TrendingUp, Layers, BedDouble, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import api from '../../services/api';

export const OccupancyAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [occRes, sumRes] = await Promise.all([
        api.get('/analytics/occupancy'),
        api.get('/analytics/dashboard-summary')
      ]);

      if (occRes.success) setData(occRes);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Calculating occupancy metrics and trends..." />;
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

  const bedPieData = [
    { name: 'Occupied', value: summary?.occupied_beds || 0, color: '#6366f1' },
    { name: 'Available', value: summary?.available_beds || 0, color: '#10b981' },
    { name: 'Reserved', value: summary?.reserved_beds || 0, color: '#f59e0b' },
    { name: 'Maintenance', value: summary?.maintenance_beds || 0, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <PieIcon className="w-6 h-6 text-indigo-400" />
          <span>Occupancy Analytics & Forecasting</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics on bed allocation, floor-wise saturation, and 6-month historical occupancy curves.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Current Occupancy"
          value={`${summary?.occupancy_rate || 0}%`}
          subtitle="Live Capacity Saturation"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Occupied Beds"
          value={summary?.occupied_beds || 0}
          subtitle="Active Residents"
          icon={BedDouble}
          color="purple"
        />
        <StatCard
          title="Available Beds"
          value={summary?.available_beds || 0}
          subtitle="Ready for Allocation"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Total Rooms"
          value={summary?.total_rooms || 0}
          subtitle={`Across ${summary?.total_floors || 5} Floors`}
          icon={Layers}
          color="blue"
        />
      </div>

      {/* Main Charts: Floor Wise & Bed Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floor-wise Occupancy Bar Chart (8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Floor-Wise Occupancy (Beds)</h3>
              <p className="text-xs text-slate-400">Occupied vs Available beds per building floor</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.floorWise || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="floor_number" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="occupied_beds" name="Occupied Beds" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="available_beds" name="Available Beds" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Bed Status Breakdown</h3>
            <p className="text-xs text-slate-400">Real-time status ratio</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bedPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bedPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{summary?.occupancy_rate}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupancy</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-slate-300">Occupied: {summary?.occupied_beds}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Available: {summary?.available_beds}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Occupancy Trend Curve */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">6-Month Occupancy Growth Trend</h3>
          <p className="text-xs text-slate-400">Monthly occupancy rate (%) over time</p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.occupancyTrend || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="occupancy_rate"
                name="Occupancy %"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5, fill: '#6366f1' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
