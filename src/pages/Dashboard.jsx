import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, User, Sun, Moon,
  Settings, Eye, Menu, X, PanelLeftClose, PanelLeftOpen, Shield, HardDrive, Sparkles
} from 'lucide-react';
import { clearSessionData, getSessionUser, isAdminUser } from '../lib/session';
import AppBottomNav from '../components/AppBottomNav';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getSessionUser() || { username: 'Tecnico', role: 'colaborador' };
  const isAdmin = isAdminUser(user);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    clearSessionData();
    navigate('/', { replace: true });
  };

  const navigateAndCloseMobile = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const styles = {
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/60 border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-400',
    card: theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40',
  };

  const sidebarLinks = [
    { id: 'abrir', label: 'Abrir chamado', icon: HardDrive, action: () => navigate('/abrir-chamado') },
    { id: 'visualizar', label: 'Visualizar Falhas', icon: Eye, action: () => navigate('/visualizar') },
    ...(isAdmin
      ? [{
          id: 'admin',
          label: 'Administracao',
          icon: Settings,
          action: () => navigate('/admin?tab=indicadores'),
          helper: 'Dashboard KPI | Gestao de Equipe',
        }]
      : []),
  ];

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      <header className={`md:hidden sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-2xl ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg shadow-red-600/30">L</div>
            <div>
              <p className="text-sm font-black italic leading-none">LENOVO</p>
              <p className={`text-[9px] font-black uppercase tracking-wider ${styles.subtext}`}>Welcome Hub</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className={`p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Fechar menu" />
          <aside className={`absolute right-0 top-0 h-full w-[88%] max-w-sm border-l p-6 flex flex-col shadow-2xl ${
            theme === 'dark' ? 'bg-[#060606]/95 border-white/10 backdrop-blur-2xl' : 'bg-white/95 border-slate-200 backdrop-blur-2xl'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Navegacao</p>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                <X size={16} />
              </button>
            </div>
            <nav className="space-y-3">
              <button
                type="button"
                onClick={() => navigateAndCloseMobile('/abrir-chamado')}
                className={`w-full min-h-12 flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
              >
                <HardDrive size={18} className="group-hover:text-red-600 transition-all" /> Abrir chamado
              </button>
              <button
                type="button"
                onClick={() => navigateAndCloseMobile('/visualizar')}
                className={`w-full min-h-12 flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
              >
                <Eye size={18} className="group-hover:text-red-600 transition-all" /> Visualizar Falhas
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigateAndCloseMobile('/admin?tab=indicadores')}
                  className={`w-full min-h-12 flex items-start gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
                >
                  <Settings size={18} className="group-hover:text-red-600 transition-all mt-0.5" />
                  <span>
                    <span className="block">Administracao</span>
                    <span className="block text-[9px] tracking-wide normal-case opacity-70">Dashboard KPI | Gestao de equipe</span>
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigateAndCloseMobile('/alterar-senha')}
                className={`w-full min-h-12 flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
              >
                <Shield size={18} className="group-hover:text-red-600 transition-all" /> Seguranca
              </button>
              <button
                type="button"
                onClick={() => navigateAndCloseMobile('/dashboard')}
                className={`w-full min-h-12 flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
              >
                <LayoutDashboard size={18} className="group-hover:text-red-600 transition-all" /> Voltar ao inicio
              </button>
            </nav>
            <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
              <button onClick={toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-[11px] font-black uppercase">Tema</span>
                {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
              </button>
              <button onClick={handleLogout} className="w-full min-h-12 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest transition-all">
                Encerrar Sessao
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-24' : 'w-64'} border-r ${styles.sidebar} p-4 flex-col z-20 backdrop-blur-xl transition-all duration-300`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/20">L</div>
            {!sidebarCollapsed && <div>
              <h1 className="text-xl font-black tracking-tighter italic leading-none">LENOVO</h1>
              <span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">Welcome Hub</span>
            </div>}
          </div>
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarLinks.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={group.action}
              className={`w-full flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 hover:translate-x-1 rounded-2xl transition-all group font-black text-[10px] tracking-widest uppercase text-left`}
            >
              <group.icon size={18} className="group-hover:text-red-600 transition-all" />
              {!sidebarCollapsed && (
                <span className="leading-tight">
                  <span className="block">{group.label}</span>
                  {group.helper && <span className="block text-[8px] tracking-wide normal-case opacity-60">{group.helper}</span>}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
          <button onClick={toggleTheme} className={`w-full p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            {!sidebarCollapsed && <span className="text-[10px] font-black uppercase">Tema</span>}
            {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600"><User size={20} /></div>
            {!sidebarCollapsed && <div className="overflow-hidden">
              <p className={`text-[8px] font-black uppercase ${styles.subtext}`}>Usuario:</p>
              <p className="text-sm font-black truncate italic leading-none">{user.username}</p>
            </div>}
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all uppercase text-xs">
            <LogOut size={16} /> {!sidebarCollapsed && 'Encerrar Sessao'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto z-10">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-red-600/20 p-8 md:p-12 bg-gradient-to-br from-red-600/10 via-transparent to-transparent">
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-600/30 text-red-500 mb-6 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> Painel de Boas-vindas
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Bem-vindo ao <span className="text-red-600">Centro Lenovo</span>
            </h2>
            <p className={`mt-6 text-sm md:text-base max-w-2xl ${styles.subtext}`}>
              Ambiente principal de operacao. Use os atalhos diretos para abrir chamados e acompanhar falhas em tempo real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/abrir-chamado')}
                className="px-6 py-3 rounded-2xl bg-red-600 text-white font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all"
              >
                Abrir chamado
              </button>
              <button
                type="button"
                onClick={() => navigate('/visualizar')}
                className={`px-6 py-3 rounded-2xl border font-black uppercase text-xs tracking-widest transition-all ${theme === 'dark' ? 'border-white/15 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-100'}`}
              >
                Visualizar falhas
              </button>
            </div>
          </div>
        </div>
      </main>

      <AppBottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default Dashboard;
