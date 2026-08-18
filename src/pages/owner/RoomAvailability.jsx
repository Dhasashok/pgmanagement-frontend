import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  UserPlus,
  ArrowRightLeft,
  Phone,
  Mail,
  Shield
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const preferredRoom = (floor) =>
  floor?.rooms?.find((room) => Number(room.available_beds) > 0) || floor?.rooms?.[0] || null;

const formatSharing = (type) => {
  if (!type) return 'Sharing';
  const clean = String(type).toLowerCase().replace(/_/g, ' ');
  if (clean.includes('single') || clean.includes('1')) return '1-Sharing';
  if (clean.includes('double') || clean.includes('two') || clean.includes('2')) return '2-Sharing';
  if (clean.includes('triple') || clean.includes('three') || clean.includes('3')) return '3-Sharing';
  if (clean.includes('four') || clean.includes('4')) return '4-Sharing';
  if (clean.includes('five') || clean.includes('5')) return '5-Sharing';
  if (clean.includes('six') || clean.includes('6')) return '6-Sharing';
  if (clean.includes('seven') || clean.includes('7')) return '7-Sharing';
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
};

export const RoomAvailability = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, occupied, reserved
  const [searchFilter, setSearchFilter] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBedForAssign, setSelectedBedForAssign] = useState(null);
  const [unassignedTenants, setUnassignedTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [tenantDetailModalOpen, setTenantDetailModalOpen] = useState(false);
  const [viewedTenant, setViewedTenant] = useState(null);

  const [bedDetailModalOpen, setBedDetailModalOpen] = useState(false);
  const [viewedBed, setViewedBed] = useState(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [allAvailableBeds, setAllAvailableBeds] = useState([]);
  const [transferTargetBedId, setTransferTargetBedId] = useState('');

  const handleInspectBed = async (bed) => {
    if (bed.tenant_id) {
      await openTenantModal(bed.tenant_id);
    } else {
      setViewedBed(bed);
      setBedDetailModalOpen(true);
    }
  };

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pg/hierarchy');
      if (res.success && res.hierarchy) {
        setHierarchy(res.hierarchy);
        // Default to the first room with a vacant bed on the selected floor
        if (res.hierarchy.length > 0 && !selectedFloor) {
          setSelectedFloor(res.hierarchy[0]);
          if (!selectedRoom) setSelectedRoom(preferredRoom(res.hierarchy[0]));
        } else if (selectedFloor) {
          const updatedFlr = res.hierarchy.find((f) => f.id === selectedFloor.id) || res.hierarchy[0];
          setSelectedFloor(updatedFlr);
          if (selectedRoom) {
            const updatedRm = updatedFlr.rooms.find((r) => r.id === selectedRoom.id);
            setSelectedRoom(updatedRm?.available_beds > 0 ? updatedRm : preferredRoom(updatedFlr));
          } else {
            setSelectedRoom(preferredRoom(updatedFlr));
          }
        }
      }
    } catch (err) {
      showError('Failed to load room availability matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHierarchy();
  }, []);

  const openAssignModal = async (bed) => {
    setSelectedBedForAssign(bed);
    try {
      const res = await api.get('/tenants?status=active');
      if (res.success) {
        setUnassignedTenants(res.tenants);
        if (res.tenants.length > 0) setSelectedTenantId(res.tenants[0].id);
      }
      setAssignModalOpen(true);
    } catch (err) {
      showError('Failed to fetch tenants list');
    }
  };

  const handleAssignTenant = async () => {
    if (!selectedTenantId || !selectedBedForAssign) return;
    setAssigning(true);
    try {
      const res = await api.post(`/tenants/${selectedTenantId}/assign-bed`, {
        bed_id: selectedBedForAssign.id
      });
      if (res.success) {
        showSuccess(`Bed ${selectedBedForAssign.bed_number} assigned successfully!`);
        setAssignModalOpen(false);
        await loadHierarchy();
      }
    } catch (err) {
      showError(err.message || 'Failed to assign bed');
    } finally {
      setAssigning(false);
    }
  };

  const openTenantModal = async (tenantId) => {
    if (!tenantId) return;
    try {
      const res = await api.get(`/tenants/${tenantId}`);
      if (res.success) {
        setViewedTenant(res.tenant);
        setTenantDetailModalOpen(true);
      }
    } catch (err) {
      showError('Failed to fetch tenant details');
    }
  };

  const openTransferModal = (tenant) => {
    setViewedTenant(tenant);
    const avail = [];
    hierarchy.forEach((flr) => {
      flr.rooms.forEach((rm) => {
        rm.beds.forEach((bd) => {
          if (bd.status === 'available') {
            avail.push({
              ...bd,
              floor_number: flr.floor_number,
              room_number: rm.room_number,
              label: `Floor ${flr.floor_number} • Room ${rm.room_number} • ${bd.bed_number}`
            });
          }
        });
      });
    });
    setAllAvailableBeds(avail);
    if (avail.length > 0) setTransferTargetBedId(avail[0].id);
    setTenantDetailModalOpen(false);
    setTransferModalOpen(true);
  };

  const handleTransferBed = async () => {
    if (!viewedTenant || !transferTargetBedId) return;
    setAssigning(true);
    try {
      const res = await api.post(`/tenants/${viewedTenant.id}/assign-bed`, {
        bed_id: transferTargetBedId,
        notes: 'Transferred by admin'
      });
      if (res.success) {
        showSuccess('Tenant transferred to new bed successfully!');
        setTransferModalOpen(false);
        await loadHierarchy();
      }
    } catch (err) {
      showError(err.message || 'Transfer failed');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading bed availability..." />;
  }

  // Filtered beds in selected room
  const currentBeds = selectedRoom?.beds || [];
  const filteredBeds = currentBeds.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchFilter) {
      const term = searchFilter.toLowerCase();
      const matchBed = b.bed_number.toLowerCase().includes(term);
      const matchTenant = b.tenant_name?.toLowerCase().includes(term);
      return matchBed || matchTenant;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Floor Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {hierarchy
          .filter((flr) => Number(flr.total_beds) > 0 || hierarchy.length <= 2)
          .map((flr) => {
            const isSelected = selectedFloor?.id === flr.id;
            const cleanFloorName = flr.name
              ? flr.name.replace(/[-–—].*$/, '').trim()
              : `Floor ${flr.floor_number}`;
            const roundedRate = Math.round(Number(flr.occupancy_rate) || 0);

            return (
              <button
                key={flr.id}
                onClick={() => {
                  setSelectedFloor(flr);
                  setSelectedRoom(preferredRoom(flr));
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-sm tracking-tight">{cleanFloorName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                    }`}
                  >
                    {roundedRate}% Full
                  </span>
                </div>
                <div className="text-xs space-y-0.5 opacity-90">
                  <p className="text-slate-400">Total Beds: {flr.total_beds}</p>
                  <p
                    className={
                      isSelected
                        ? 'text-indigo-100 font-bold'
                        : flr.available_beds > 0
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-500'
                    }
                  >
                    {flr.available_beds > 0 ? `${flr.available_beds} Available` : 'Fully Occupied'}
                  </p>
                </div>
              </button>
            );
          })}
      </div>

      {/* Rooms List & Bed Layout Drill Down */}
      {selectedFloor && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rooms Column (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Rooms on {selectedFloor.name ? selectedFloor.name.replace(/[-–—].*$/, '').trim() : `Floor ${selectedFloor.floor_number}`} ({selectedFloor.rooms.length} Rooms)
              </h3>

              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {selectedFloor.rooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  const isFull = Number(room.available_beds) === 0;

                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/40'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">Room {room.room_number}</span>
                          <span className="text-[10px] font-semibold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                            {formatSharing(room.room_type)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Rent: ₹{Number(room.base_rent).toLocaleString('en-IN')}/mo
                        </p>
                      </div>

                      <div className="text-right">
                        {isFull ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            Full ({room.occupied_beds}/{room.total_beds})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {room.available_beds} Vacant
                          </span>
                        )}
                        <p className="text-[10px] text-slate-500 mt-1">
                          {room.occupied_beds}/{room.total_beds} Occupied
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Individual Room Bed Layout Matrix (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedRoom ? (
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
                {/* Room Details Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-extrabold text-white">Room {selectedRoom.room_number}</h2>
                      <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold">
                        {formatSharing(selectedRoom.room_type)}
                      </span>
                      {selectedRoom.has_ac ? (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">
                          AC
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Floor {selectedFloor.floor_number} • Rent: ₹{Number(selectedRoom.base_rent).toLocaleString('en-IN')}/month
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs">
                    <div className="text-center px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Total Beds</span>
                      <span className="font-bold text-white text-sm">{selectedRoom.total_beds}</span>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-indigo-950/60 rounded-xl border border-indigo-500/30">
                      <span className="text-indigo-300 block text-[10px]">Occupied</span>
                      <span className="font-bold text-indigo-200 text-sm">{selectedRoom.occupied_beds}</span>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-emerald-950/60 rounded-xl border border-emerald-500/30">
                      <span className="text-emerald-300 block text-[10px]">Vacant</span>
                      <span className="font-bold text-emerald-300 text-sm">{selectedRoom.available_beds}</span>
                    </div>
                  </div>
                </div>

                {/* Filter and Bed Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { key: 'all', label: 'All Beds' },
                      { key: 'available', label: 'Vacant' },
                      { key: 'occupied', label: 'Occupied' },
                      { key: 'reserved', label: 'Reserved' }
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => setStatusFilter(st.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                          statusFilter === st.key
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-800/70 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter beds or residents..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-56"
                    />
                  </div>
                </div>

                {/* Visual Bed Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredBeds.map((bed) => {
                    const isOccupied = bed.status === 'occupied';
                    const isAvailable = bed.status === 'available';

                    return (
                      <div
                        key={bed.id}
                        className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[195px] ${
                          isOccupied
                            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-emerald-500/30 shadow-lg'
                            : isAvailable
                            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-indigo-500/30 shadow-lg'
                            : 'bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500/30 shadow-lg'
                        }`}
                      >
                        {/* Top Bed Header */}
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-2 rounded-xl ${
                                isOccupied
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : isAvailable
                                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              <BedDouble className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-sm text-white tracking-wide">{bed.bed_number}</span>
                          </div>

                          {isOccupied ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              ● Occupied
                            </span>
                          ) : isAvailable ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              ● Vacant
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              ● Reserved
                            </span>
                          )}
                        </div>

                        {/* Middle Content */}
                        <div className="py-2.5 flex-1 flex flex-col justify-center">
                          {isOccupied && bed.tenant_name ? (
                            <div
                              onClick={() => openTenantModal(bed.tenant_id)}
                              className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 cursor-pointer transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={bed.tenant_photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                                  alt={bed.tenant_name}
                                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-500/50 shrink-0"
                                />
                                <div className="overflow-hidden leading-tight flex-1">
                                  <p className="text-xs font-bold text-white truncate">{bed.tenant_name}</p>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{bed.tenant_phone}</p>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 shrink-0">
                                  Active
                                </span>
                              </div>
                            </div>
                          ) : isAvailable ? (
                            <div className="p-3 text-center bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                              <span className="text-xs font-extrabold text-white block">
                                ₹{Number(bed.monthly_rent || selectedRoom.base_rent).toLocaleString('en-IN')} / mo
                              </span>
                              <span className="text-[10px] text-indigo-300 mt-0.5 block">Ready for Immediate Stay</span>
                            </div>
                          ) : (
                            <div className="p-3 text-center bg-amber-500/5 border border-amber-500/20 rounded-xl">
                              <span className="text-xs font-bold text-amber-300 block">Reserved / Joining Soon</span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">Pre-booked by resident</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">
                            Rent: ₹{Number(bed.monthly_rent || selectedRoom.base_rent).toLocaleString('en-IN')}/mo
                          </span>

                          {isAvailable ? (
                            <button
                              type="button"
                              onClick={() => openAssignModal(bed)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Assign Bed</span>
                            </button>
                          ) : isOccupied ? (
                            <button
                              type="button"
                              onClick={() => openTenantModal(bed.tenant_id)}
                              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition"
                            >
                              Details &rarr;
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleInspectBed(bed)}
                              className="px-2.5 py-1 bg-amber-500/15 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/30 transition"
                            >
                              Manage Bed
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 p-12 rounded-3xl border border-slate-800 text-center text-slate-400">
                Please select a room from the left to view bed layout.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Assign Tenant to Bed */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Resident to ${selectedBedForAssign?.bed_number}`}
        subtitle={`Room ${selectedRoom?.room_number} • Floor ${selectedFloor?.floor_number}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Resident</label>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {unassignedTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.mobile_number}) - {t.occupation_type}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs space-y-1">
            <p className="font-bold text-white">Bed Assignment Details:</p>
            <p className="text-slate-300">• Room Type: {formatSharing(selectedRoom?.room_type)}</p>
            <p className="text-slate-300">
              • Monthly Rent: ₹{Number(selectedBedForAssign?.monthly_rent || 6000).toLocaleString('en-IN')}
            </p>
            <p className="text-slate-300">• Status: Bed will become "Occupied".</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignTenant}
              disabled={assigning || !selectedTenantId}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Confirm Allocation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: View Tenant Details Card */}
      <Modal
        isOpen={tenantDetailModalOpen}
        onClose={() => setTenantDetailModalOpen(false)}
        title={viewedTenant?.full_name || 'Resident Details'}
        subtitle={`Room ${viewedTenant?.room_number || 'N/A'} • Bed: ${viewedTenant?.bed_number || 'N/A'}`}
      >
        {viewedTenant && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <img
                src={viewedTenant.profile_photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                alt={viewedTenant.full_name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-white">{viewedTenant.full_name}</h4>
                  <Badge variant={viewedTenant.status}>{viewedTenant.status}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {viewedTenant.occupation_type === 'working'
                    ? `Working at ${viewedTenant.company_name || 'Organization'}`
                    : `Student at ${viewedTenant.college_name || 'College'}`}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1 text-indigo-300">
                    <Phone className="w-3.5 h-3.5" /> {viewedTenant.mobile_number}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Mail className="w-3.5 h-3.5" /> {viewedTenant.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Emergency Contact
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact Person</span>
                  <span className="font-bold text-white">
                    {viewedTenant.emergency_contact_name} ({viewedTenant.relationship_with_emergency_contact})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Emergency Phone</span>
                  <a href={`tel:${viewedTenant.emergency_contact_number}`} className="font-bold text-amber-300 hover:underline">
                    {viewedTenant.emergency_contact_number}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions: Bed Transfer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => openTransferModal(viewedTenant)}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Transfer Room / Bed</span>
              </button>

              <button
                onClick={() => setTenantDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Transfer Bed */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title={`Transfer ${viewedTenant?.full_name} to Another Bed`}
        subtitle="Select a target available room and bed across the building"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Target Bed</label>
            <select
              value={transferTargetBedId}
              onChange={(e) => setTransferTargetBedId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {allAvailableBeds.length === 0 ? (
                <option value="">No available beds found in building</option>
              ) : (
                allAvailableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label} - (Rent: ₹{Number(b.monthly_rent).toLocaleString('en-IN')})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs space-y-1">
            <p className="font-bold text-white">Transfer Operations:</p>
            <p className="text-slate-300">
              • Current bed ({viewedTenant?.bed_number}) will automatically become <strong>Available</strong>.
            </p>
            <p className="text-slate-300">
              • Selected target bed will turn to <strong>Occupied</strong>.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setTransferModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleTransferBed}
              disabled={assigning || !transferTargetBedId}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition disabled:opacity-50"
            >
              {assigning ? 'Processing Transfer...' : 'Complete Transfer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Inspect Bed Details */}
      <Modal
        isOpen={bedDetailModalOpen}
        onClose={() => setBedDetailModalOpen(false)}
        title={`Bed Assignment: ${viewedBed?.bed_number || 'Bed'}`}
        subtitle={`Floor ${selectedFloor?.floor_number || 1} • Room ${selectedRoom?.room_number || '101'}`}
      >
        {viewedBed && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{viewedBed.bed_number}</h4>
                    <p className="text-xs text-slate-400">
                      Room {selectedRoom?.room_number} • {formatSharing(selectedRoom?.room_type)}
                    </p>
                  </div>
                </div>
                <Badge variant={viewedBed.status}>{viewedBed.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/50">
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Rent</span>
                  <span className="font-bold text-white text-sm">
                    ₹{Number(viewedBed.monthly_rent || selectedRoom?.base_rent || 6000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Security Deposit</span>
                  <span className="font-bold text-white text-sm">
                    ₹{Number(viewedBed.security_deposit || (selectedRoom?.base_rent || 6000) * 2).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Room Amenities</span>
                  <span className="font-semibold text-indigo-300">
                    {selectedRoom?.has_ac ? 'AC Room' : 'Non-AC'} • Attached Washroom
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Occupancy State</span>
                  <span className="font-semibold text-slate-200 capitalize">{viewedBed.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setBedDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
              {viewedBed.status === 'available' && (
                <button
                  type="button"
                  onClick={() => {
                    setBedDetailModalOpen(false);
                    openAssignModal(viewedBed);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign Resident</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
