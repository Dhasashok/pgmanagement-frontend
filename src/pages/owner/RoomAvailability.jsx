import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3,
  Layers,
  BedDouble,
  Users,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  Search,
  UserPlus,
  ArrowLeft,
  ChevronRight,
  Phone,
  Mail,
  Shield,
  ArrowRightLeft
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const preferredRoom = (floor) =>
  floor?.rooms?.find((room) => room.available_beds > 0) || floor?.rooms?.[0] || null;

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
        // Default to the first room with a vacant bed on the selected floor.
        if (res.hierarchy.length > 0 && !selectedFloor) {
          setSelectedFloor(res.hierarchy[0]);
          if (!selectedRoom) setSelectedRoom(preferredRoom(res.hierarchy[0]));
        } else if (selectedFloor) {
          const updatedFlr = res.hierarchy.find(f => f.id === selectedFloor.id) || res.hierarchy[0];
          setSelectedFloor(updatedFlr);
          if (selectedRoom) {
            const updatedRm = updatedFlr.rooms.find(r => r.id === selectedRoom.id);
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
        // Filter out tenants already assigned or show all
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
    // Collect all available beds across the PG
    const avail = [];
    hierarchy.forEach(flr => {
      flr.rooms.forEach(rm => {
        rm.beds.forEach(bd => {
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
    return <LoadingSpinner label="Generating interactive bed availability hierarchy..." />;
  }

  // Filtered beds in selected room
  const currentBeds = selectedRoom?.beds || [];
  const filteredBeds = currentBeds.filter(b => {
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
      {/* Compact status legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card p-3 rounded-2xl border border-slate-800">
        <h1 className="text-base font-bold text-white">Bed Availability</h1>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="available_red">Available</Badge>
          <Badge variant="occupied">Occupied</Badge>
          <Badge variant="reserved">Reserved</Badge>
        </div>
      </div>

      {/* Step 1: Floor Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {hierarchy.map((flr) => {
          const isSelected = selectedFloor?.id === flr.id;
          return (
            <button
              key={flr.id}
              onClick={() => {
                setSelectedFloor(flr);
                setSelectedRoom(preferredRoom(flr));
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30 scale-[1.02]'
                  : 'glass-card border-slate-800 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-sm tracking-tight">Floor {flr.floor_number}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {flr.occupancy_rate}%
                </span>
              </div>
              <div className="text-xs space-y-0.5 opacity-90">
                <p>Total Beds: {flr.total_beds}</p>
                <p className={isSelected ? 'text-red-100' : 'text-red-400'}>
                  Available: {flr.available_beds}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step 2 & 3: Rooms List & Bed Layout Drill Down */}
      {selectedFloor && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rooms Column (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Rooms on Floor {selectedFloor.floor_number} ({selectedFloor.rooms.length} Rooms)
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {selectedFloor.rooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">Room {room.room_number}</span>
                          <span className="text-[10px] uppercase font-semibold text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded">
                            {room.room_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Rent: ₹{Number(room.base_rent).toLocaleString('en-IN')}/mo
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-bold ${room.available_beds > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                          {room.available_beds} Available
                        </span>
                        <p className="text-[10px] text-slate-400">
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
              <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
                {/* Room Details Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-extrabold text-white">ROOM {selectedRoom.room_number}</h2>
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold">
                        {selectedRoom.room_type.replace('_', ' ')}
                      </span>
                      {selectedRoom.has_ac ? (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">AC</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Floor {selectedFloor.floor_number} • Monthly Rent: ₹{Number(selectedRoom.base_rent).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-center px-3 py-1.5 bg-slate-800/80 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Total Beds</span>
                      <span className="font-bold text-white text-sm">{selectedRoom.total_beds}</span>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-indigo-950/60 rounded-xl border border-indigo-500/20">
                      <span className="text-indigo-300 block text-[10px]">Occupied</span>
                      <span className="font-bold text-indigo-200 text-sm">{selectedRoom.occupied_beds}</span>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-red-950/60 rounded-xl border border-red-500/30">
                      <span className="text-red-300 block text-[10px]">Available</span>
                      <span className="font-bold text-red-200 text-sm">{selectedRoom.available_beds}</span>
                    </div>
                  </div>
                </div>

                {/* Filter and Bed Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {['all', 'available', 'occupied', 'reserved'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                          statusFilter === st
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-800/70 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter beds or tenants..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Visual Bed Cards Grid (Interactive Layout with 3 Color Codes) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredBeds.map((bed) => {
                    const isOccupied = bed.status === 'occupied';
                    const isAvailable = bed.status === 'available';
                    const isReserved = bed.status === 'reserved' || bed.status === 'pre_booked' || bed.status === 'maintenance';

                    return (
                      <motion.div
                        key={bed.id}
                        data-testid={`bed-card-${bed.bed_number.replace(/\s+/g, '-').toLowerCase()}`}
                        aria-label={`Inspect bed ${bed.bed_number}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -3 }}
                        onClick={() => handleInspectBed(bed)}
                        className={`p-4 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between cursor-pointer ${
                          isOccupied
                            ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/40 hover:border-emerald-500/70 shadow-lg shadow-emerald-950/30'
                            : isAvailable
                            ? 'bg-gradient-to-br from-red-950/30 to-slate-900 border-red-500/40 hover:border-red-500/70 shadow-lg shadow-red-950/30'
                            : 'bg-gradient-to-br from-amber-950/30 to-slate-900 border-amber-500/40 hover:border-amber-500/70 shadow-lg shadow-amber-950/30'
                        }`}
                      >
                        {/* Top Bed Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl ${
                              isOccupied 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : isAvailable 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              <BedDouble className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-sm text-white tracking-wide">{bed.bed_number}</span>
                          </div>
                          {isOccupied ? (
                            <Badge variant="occupied" size="sm">🟢 Occupied</Badge>
                          ) : isAvailable ? (
                            <Badge variant="available" size="sm">🔴 Vacant</Badge>
                          ) : (
                            <Badge variant="reserved" size="sm">🟡 Reserved / Joining Soon</Badge>
                          )}
                        </div>

                        {/* Middle Content */}
                        <div className="py-2">
                          {isOccupied && bed.tenant_name ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                openTenantModal(bed.tenant_id);
                              }}
                              className="p-2.5 rounded-xl bg-slate-800/80 border border-emerald-500/20 cursor-pointer hover:border-emerald-400 transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={bed.tenant_photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                                  alt={bed.tenant_name}
                                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-500/50 shrink-0"
                                />
                                <div className="overflow-hidden leading-tight flex-1">
                                  <p className="text-xs font-bold text-white truncate">{bed.tenant_name}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{bed.tenant_phone}</p>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">Active</span>
                              </div>
                            </div>
                          ) : isAvailable ? (
                            <div className="p-3 text-center bg-red-500/5 border border-red-500/30 rounded-xl">
                              <p className="text-xs font-bold text-red-300">Ready to Rent</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Click anywhere to inspect or assign</p>
                            </div>
                          ) : (
                            <div className="p-3 text-center bg-amber-500/5 border border-amber-500/30 rounded-xl">
                              <p className="text-xs font-bold text-amber-300">Reserved / Joining Soon</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Pre-booked or onboarding</p>
                            </div>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-3 border-t border-slate-800/60 mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            Rent: ₹{Number(bed.monthly_rent || selectedRoom.base_rent).toLocaleString('en-IN')}/mo
                          </span>

                          <div className="flex items-center gap-2">
                            {isAvailable ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInspectBed(bed);
                                  }}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition"
                                >
                                  Inspect Bed
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAssignModal(bed);
                                  }}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center gap-1"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Assign</span>
                                </button>
                              </>
                            ) : isOccupied ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTenantModal(bed.tenant_id);
                                }}
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition"
                              >
                                Details &rarr;
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInspectBed(bed);
                                }}
                                className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-lg transition"
                              >
                                Inspect
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center text-slate-400">
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
            <p className="text-slate-300">• Room Type: {selectedRoom?.room_type.replace('_', ' ')}</p>
            <p className="text-slate-300">• Monthly Rent: ₹{Number(selectedBedForAssign?.monthly_rent || 6000).toLocaleString('en-IN')}</p>
            <p className="text-slate-300">• Automatic status change: Bed will turn to "Occupied".</p>
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
                  {viewedTenant.occupation_type === 'working' ? `Working at ${viewedTenant.company_name || 'IT Tech'}` : `Student at ${viewedTenant.college_name || 'University'}`}
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
                  <span className="font-bold text-white">{viewedTenant.emergency_contact_name} ({viewedTenant.relationship_with_emergency_contact})</span>
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
            <p className="text-slate-300">• Current bed ({viewedTenant?.bed_number}) will automatically become <strong>Available</strong>.</p>
            <p className="text-slate-300">• Selected target bed will turn to <strong>Occupied</strong>.</p>
            <p className="text-slate-300">• Assignment history will be logged with timestamp.</p>
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
                    <p className="text-xs text-slate-400">Room {selectedRoom?.room_number} • {selectedRoom?.room_type?.replace('_', ' ')}</p>
                  </div>
                </div>
                <Badge variant={viewedBed.status}>{viewedBed.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/50">
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Rent</span>
                  <span className="font-bold text-white text-sm">₹{Number(viewedBed.monthly_rent || selectedRoom?.base_rent || 6000).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Security Deposit</span>
                  <span className="font-bold text-white text-sm">₹{Number(viewedBed.security_deposit || (selectedRoom?.base_rent || 6000) * 2).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Room Amenities</span>
                  <span className="font-semibold text-indigo-300">{selectedRoom?.has_ac ? 'AC Room' : 'Non-AC'} • Attached Washroom</span>
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
