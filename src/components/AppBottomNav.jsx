import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Eye, ShieldCheck } from 'lucide-react';

export default function AppBottomNav({ isAdmin = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { key: 'falhas', label: 'Falhas', icon: Eye, path: '/visualizar' },
    ...(isAdmin ? [{ key: 'admin', label: 'Admin', icon: ShieldCheck, path: '/admin' }] : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-1 px-3 py-2">
        {items.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={`h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                active ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon size={18} />
              <span className="text-[10px] font-black uppercase tracking-wide mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

