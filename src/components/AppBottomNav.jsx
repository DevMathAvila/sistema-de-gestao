import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Eye, ShieldCheck } from 'lucide-react';

export default function AppBottomNav({ isAdmin = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { key: 'falhas', label: 'Falhas', icon: Eye, path: '/visualizar' },
    ...(isAdmin ? [{ key: 'admin', label: 'Admin', icon: ShieldCheck, path: '/admin?tab=indicadores' }] : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)] pt-2">
      <div className="absolute inset-x-6 -top-6 h-10 bg-red-500/20 blur-2xl pointer-events-none" />
      <div className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 rounded-[1.6rem] border border-red-500/25 bg-gradient-to-b from-white/15 via-white/5 to-white/0 shadow-[0_14px_40px_rgba(220,38,38,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl px-2.5 py-2`}>
        {items.map((item) => {
          const pathBase = item.path.split('?')[0];
          const active = location.pathname.startsWith(pathBase);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={`h-14 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95 ${
                active
                  ? 'border-red-300/70 bg-gradient-to-b from-red-500/95 to-red-700/85 text-white shadow-[0_10px_24px_rgba(220,38,38,0.45)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-200 hover:text-white hover:border-red-400/35 hover:bg-red-500/10'
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
