import React, { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  House,
  PlusCircle,
  Eye,
  Settings2,
  LayoutDashboard,
  Users,
  ChartColumn,
  History,
  MessageCircleMore,
  LogOut,
  MoonStar,
  Circle,
} from 'lucide-react';
import { clearSessionData, getSessionUser, isAdminUser } from '../lib/session';
import { useThemeMode } from '../lib/theme.jsx';

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
          isActive
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/35'
            : 'text-slate-200 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}

function ThemeToggle() {
  const { mode, isBlack, toggleMode } = useThemeMode();

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="group relative inline-flex h-10 w-[118px] items-center rounded-full border border-white/20 bg-black/40 px-1"
      title="Alternar entre Dark e Black OLED"
    >
      <span
        className={`absolute top-1 h-8 w-[54px] rounded-full bg-red-600 transition ${isBlack ? 'translate-x-[56px]' : 'translate-x-0'}`}
      />
      <span className={`relative z-10 flex w-1/2 items-center justify-center gap-1 text-[10px] font-bold uppercase ${mode === 'dark' ? 'text-white' : 'text-slate-300'}`}>
        <MoonStar size={12} /> Dark
      </span>
      <span className={`relative z-10 flex w-1/2 items-center justify-center gap-1 text-[10px] font-bold uppercase ${mode === 'black' ? 'text-white' : 'text-slate-300'}`}>
        <Circle size={12} /> Black
      </span>
    </button>
  );
}

export default function TopHeaderNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getSessionUser() || { username: 'Usuario', role: 'colaborador' };
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = isAdminUser(user);
  const showAdminSubmenu = location.pathname.startsWith('/admin');

  const topItems = useMemo(() => {
    if (user.role === 'colaborador') {
      return [
        { to: '/registrar', label: 'Abrir Chamado', icon: PlusCircle },
        { to: '/fale-conosco', label: 'Fale Conosco', icon: MessageCircleMore },
      ];
    }

    if (user.role === 'tecnico') {
      return [
        { to: '/registrar', label: 'Abrir Chamado', icon: PlusCircle },
        { to: '/visualizar', label: 'Visualizar Falhas', icon: Eye },
      ];
    }

    return [
      { to: '/registrar', label: 'Abrir Chamado', icon: PlusCircle },
      { to: '/visualizar', label: 'Visualizar Falhas', icon: Eye },
      { to: '/admin', label: 'Painel Admin', icon: Settings2 },
    ];
  }, [user.role]);

  const adminItems = [
    { to: '/admin/kpi', label: 'Dashboard KPI', icon: LayoutDashboard },
    { to: '/admin/equipe', label: 'Gestao de Equipe', icon: Users },
    { to: '/admin/pareto', label: 'Pareto de Falhas', icon: ChartColumn },
    { to: '/admin/historico', label: 'Historico Geral', icon: History },
  ];

  const handleLogout = () => {
    clearSessionData();
    navigate('/', { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-black/35 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="grad-border relative inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-white transition hover:bg-white/15"
        >
          <House size={16} className="text-red-500" />
          <span className="text-sm font-black uppercase tracking-wider">Lenovo Mission</span>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {topItems.map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200">
            {user.username}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-xl border border-white/15 bg-white/10 p-2 text-white md:hidden"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isAdmin && showAdminSubmenu && (
        <div className="hidden border-t border-white/10 bg-black/45 px-4 py-2 md:block">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
            {adminItems.map((item) => (
              <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/90 p-4 md:hidden">
          <div className="mb-3">
            <ThemeToggle />
          </div>
          <div className="grid gap-2">
            {topItems.map((item) => (
              <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} onClick={() => setMobileOpen(false)} />
            ))}
            {isAdmin && showAdminSubmenu &&
              adminItems.map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} onClick={() => setMobileOpen(false)} />
              ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-xs font-bold uppercase tracking-wide text-white"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

