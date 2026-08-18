import React, { useEffect, useState } from 'react';
import { Search, Users, BedDouble, Receipt, Wrench, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const shortcuts = [
  { label: 'Tenant directory', hint: 'Find or manage residents', to: '/owner/tenants', icon: Users },
  { label: 'Room availability', hint: 'View rooms and beds', to: '/owner/rooms-availability', icon: BedDouble },
  { label: 'Rent management', hint: 'Review bills and payments', to: '/owner/rent-management', icon: Receipt },
  { label: 'Maintenance tickets', hint: 'Track complaints', to: '/owner/complaints', icon: Wrench },
];

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const go = (to) => { setOpen(false); setQuery(''); navigate(to); };
  const matchingShortcuts = shortcuts.filter(item => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <button onClick={() => setOpen(true)} className="hidden md:flex items-center gap-2 w-64 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-neutral-400 hover:border-slate-600 transition" aria-label="Search portal">
        <Search className="w-4 h-4" /><span className="text-xs flex-1 text-left">Search portal...</span><span className="text-[10px] flex items-center gap-0.5"><Command className="w-3 h-3" />K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/75 backdrop-blur-sm p-4 pt-[12vh]" onMouseDown={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-primary-400" />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tenants, rooms, payments, or complaints..." className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500" />
              <button onClick={() => setOpen(false)} className="p-1 text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-bold text-slate-500">Navigate</p>
              {matchingShortcuts.map(({ label, hint, to, icon: Icon }) => (
                <button key={to} onClick={() => go(to)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left transition">
                  <Icon className="w-4 h-4 text-indigo-400" /><div><p className="text-xs font-semibold text-white">{label}</p><p className="text-[11px] text-slate-400">{hint}</p></div>
                </button>
              ))}
              {query && matchingShortcuts.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No matching results.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
