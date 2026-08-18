import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Layers,
  Plus,
  Edit2,
  Trash2,
  BedDouble,
  ChevronDown,
  ChevronRight,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

export const BuildingManagement = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState([]);
  const [expandedFloors, setExpandedFloors] = useState({});

  // Modals
  const [floorModalOpen, setFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [floorNumber, setFloorNumber] = useState(1);

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFloorId, setRoomFloorId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('double');
  const [baseRent, setBaseRent] = useState(6000);
  const [securityDeposit, setSecurityDeposit] = useState(10000);
  const [maxBeds, setMaxBeds] = useState(2);
  const [hasAc, setHasAc] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);

  const [bedModalOpen, setBedModalOpen] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [bedRent, setBedRent] = useState(6000);

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pg/hierarchy');
      if (res.success) {
        setHierarchy(res.hierarchy || []);
        // Expand first floor by default
        if (res.hierarchy.length > 0 && Object.keys(expandedFloors).length === 0) {
          setExpandedFloors({ [res.hierarchy[0].id]: true });
        }
      }
    } catch (err) {
      showError('Failed to load building structure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleFloor = (id) => {
    setExpandedFloors(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Floor Handlers
  const openAddFloor = () => {
    setEditingFloor(null);
    setFloorNumber(hierarchy.length + 1);
    setFloorModalOpen(true);
  };

  const openEditFloor = (floor) => {
    setEditingFloor(floor);
    setFloorNumber(floor.floor_number);
    setFloorModalOpen(true);
  };

  const handleSaveFloor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingFloor) {
        await api.put(`/pg/floors/${editingFloor.id}`, { floor_number: floorNumber, name: `Floor ${floorNumber}`, description: '' });
        showSuccess('Floor updated successfully');
      } else {
        await api.post('/pg/floors', { floor_number: floorNumber, name: `Floor ${floorNumber}`, description: '' });
        showSuccess('New floor added to building');
      }
      setFloorModalOpen(false);
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to save floor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFloor = async (floorId) => {
    if (!window.confirm('Are you sure you want to delete this floor and all its rooms?')) return;
    try {
      await api.delete(`/pg/floors/${floorId}`);
      showSuccess('Floor deleted successfully');
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete floor');
    }
  };

  // Room Handlers
  const openAddRoom = (floorId) => {
    setEditingRoom(null);
    setRoomFloorId(floorId);
    setRoomNumber('');
    setRoomType('double');
    setBaseRent(6000);
    setSecurityDeposit(10000);
    setMaxBeds(2);
    setHasAc(false);
    setHasBalcony(false);
    setRoomModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRoom) {
        await api.put(`/pg/rooms/${editingRoom.id}`, {
          room_number: roomNumber,
          room_type: roomType,
          base_rent: baseRent,
          security_deposit: securityDeposit,
          has_ac: hasAc,
          has_balcony: hasBalcony
        });
        showSuccess('Room updated successfully');
      } else {
        await api.post('/pg/rooms', {
          floor_id: roomFloorId,
          room_number: roomNumber,
          room_type: roomType,
          base_rent: baseRent,
          security_deposit: securityDeposit,
          max_beds: maxBeds,
          has_ac: hasAc,
          has_balcony: hasBalcony
        });
        showSuccess(`Room ${roomNumber} created with ${maxBeds} beds.`);
      }
      setRoomModalOpen(false);
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room and its beds?')) return;
    try {
      await api.delete(`/pg/rooms/${roomId}`);
      showSuccess('Room removed');
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete room');
    }
  };

  // Bed Handlers
  const openAddBed = (roomId, rent, existingBeds = []) => {
    setTargetRoomId(roomId);
    const count = (existingBeds?.length || 0) + 1;
    const pad = count < 10 ? `0${count}` : `${count}`;
    setBedNumber(`BED ${pad}`);
    setBedRent(rent || 6000);
    setBedModalOpen(true);
  };

  const handleSaveBed = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/pg/beds', {
        room_id: targetRoomId,
        bed_number: bedNumber,
        monthly_rent: bedRent
      });
      showSuccess('Bed added successfully');
      setBedModalOpen(false);
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to add bed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading PG building structure..." />;
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building className="w-6 h-6 text-indigo-400" />
            <span>Building & Rooms</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage floors, room sharing capacities, and bed inventory.
          </p>
        </div>

        <button
          onClick={openAddFloor}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Floor</span>
        </button>
      </div>

      {/* Building Structure Hierarchy */}
      <div className="space-y-4">
        {hierarchy.map((floor) => {
          const isExpanded = !!expandedFloors[floor.id];
          const cleanFloorName = floor.name ? floor.name.replace(/[-–—].*$/, '').trim() : `Floor ${floor.floor_number}`;

          return (
            <div
              key={floor.id}
              className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden transition-all shadow-lg"
            >
              {/* Floor Header */}
              <div
                className="p-5 flex items-center justify-between bg-slate-900 cursor-pointer hover:bg-slate-800/60 transition"
                onClick={() => toggleFloor(floor.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{cleanFloorName}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300">
                    <span>{floor.rooms.length} Rooms</span>
                    <span>•</span>
                    <span>{floor.total_beds} Total Beds</span>
                    <span>•</span>
                    <span className={floor.available_beds > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {floor.available_beds > 0 ? `${floor.available_beds} Vacant` : 'Fully Occupied'}
                    </span>
                  </div>

                  <button
                    onClick={() => openAddRoom(floor.id)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Room</span>
                  </button>

                  <button
                    onClick={() => openEditFloor(floor)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    title="Edit Floor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteFloor(floor.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Delete Floor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="text-slate-400 pl-2">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Rooms in Floor (when expanded) */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                  {floor.rooms.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No rooms added yet on this floor. Click "Add Room" above to create rooms.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {floor.rooms.map((room) => {
                        const isFull = Number(room.available_beds) === 0;

                        return (
                          <div
                            key={room.id}
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-white">Room {room.room_number}</span>
                                <span className="text-[10px] text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                  {formatSharing(room.room_type)}
                                </span>
                              </div>

                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="text-slate-500 hover:text-rose-400 transition"
                                title="Delete Room"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Rent: ₹{Number(room.base_rent).toLocaleString('en-IN')}/mo</span>
                              {isFull ? (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                                  Full ({room.occupied_beds}/{room.total_beds})
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  {room.available_beds} Vacant
                                </span>
                              )}
                            </div>

                            {/* Mini Beds List */}
                            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Configured Beds ({room.beds.length}):</span>
                                <button
                                  onClick={() => openAddBed(room.id, room.base_rent, room.beds)}
                                  className="text-indigo-400 hover:text-indigo-300 font-bold text-[10px] flex items-center gap-0.5"
                                >
                                  <Plus className="w-3 h-3" /> Add Bed
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {room.beds.map((b) => (
                                  <span
                                    key={b.id}
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                                      b.status === 'occupied'
                                        ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300'
                                        : b.status === 'available'
                                        ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                                        : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                                    }`}
                                  >
                                    {b.bed_number} ({b.status === 'available' ? 'vacant' : b.status})
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add/Edit Floor */}
      <Modal
        isOpen={floorModalOpen}
        onClose={() => setFloorModalOpen(false)}
        title={editingFloor ? 'Edit Floor' : 'Add New Floor'}
        subtitle="Specify the floor number"
      >
        <form onSubmit={handleSaveFloor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Floor Number</label>
            <input
              type="number"
              required
              value={floorNumber}
              onChange={(e) => setFloorNumber(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setFloorModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
            >
              {submitting ? 'Saving...' : 'Save Floor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Room */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title="Add New Room"
        subtitle="Configure room sharing capacity, base monthly tariff and features"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 107 or 305"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => {
                  setRoomType(e.target.value);
                  const map = { single: 1, double: 2, triple: 3, four_sharing: 4, five_sharing: 5, six_sharing: 6, seven_sharing: 7 };
                  setMaxBeds(map[e.target.value] || 2);
                }}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="single">Single Room (1 Bed)</option>
                <option value="double">Double Sharing (2 Beds)</option>
                <option value="triple">Triple Sharing (3 Beds)</option>
                <option value="four_sharing">4-Sharing (4 Beds)</option>
                <option value="five_sharing">5-Sharing (5 Beds)</option>
                <option value="seven_sharing">7-Sharing (7 Beds)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bed Capacity</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxBeds}
                onChange={(e) => setMaxBeds(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Rent per Bed (₹)</label>
              <input
                type="number"
                value={baseRent}
                onChange={(e) => setBaseRent(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAc}
                onChange={(e) => setHasAc(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Air Conditioned (AC)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasBalcony}
                onChange={(e) => setHasBalcony(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Private Balcony</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setRoomModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
            >
              {submitting ? 'Creating...' : 'Create Room & Beds'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Individual Bed */}
      <Modal
        isOpen={bedModalOpen}
        onClose={() => setBedModalOpen(false)}
        title="Add Bed to Room"
        subtitle="Specify bed identification number and rental tariff"
      >
        <form onSubmit={handleSaveBed} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bed Number</label>
            <input
              type="text"
              required
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              placeholder="e.g. BED 06"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Rent (₹)</label>
            <input
              type="number"
              value={bedRent}
              onChange={(e) => setBedRent(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setBedModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              {submitting ? 'Adding...' : 'Add Bed'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
