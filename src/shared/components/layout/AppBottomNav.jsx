import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Eye from 'lucide-react/dist/esm/icons/eye';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';

export default function AppBottomNav({ isAdmin = false, theme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const resolvedTheme = theme || (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) || 'dark';
  const isDark = resolvedTheme === 'dark';

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { key: 'falhas', label: 'Falhas', icon: Eye, path: '/visualizar' },
    ...(isAdmin ? [{ key: 'admin', label: 'Admin', icon: ShieldCheck, path: '/admin?tab=indicadores' }] : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)] pt-2">
      <div className="absolute inset-x-6 -top-6 h-10 bg-red-500/25 blur-2xl pointer-events-none" />
      <div className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 rounded-[1.6rem] border px-2.5 py-2 shadow-[0_14px_40px_rgba(220,38,38,0.22)] ${
        isDark
          ? 'border-red-500/35 bg-[#0b0b0b]/95 backdrop-blur-xl'
          : 'border-red-300/70 bg-white/95 backdrop-blur-xl'
      }`}>
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
                  : isDark
                    ? 'border-white/10 bg-white/[0.04] text-slate-200 hover:text-white hover:border-red-400/35 hover:bg-red-500/10'
                    : 'border-slate-300 bg-white text-slate-900 hover:text-black hover:border-red-300 hover:bg-red-50'
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
